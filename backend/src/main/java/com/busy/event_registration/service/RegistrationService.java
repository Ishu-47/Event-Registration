package com.busy.event_registration.service;

import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.entity.Registration;
import com.busy.event_registration.entity.RegistrationStatus;
import com.busy.event_registration.entity.Session;
import com.busy.event_registration.exception.CapacityExceededException;
import com.busy.event_registration.exception.RegistrationNotFoundException;
import com.busy.event_registration.repository.RegistrationRepository;
import com.busy.event_registration.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.busy.event_registration.dto.RegistrationPageResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

        private final RegistrationRepository registrationRepository;
        private final SessionRepository sessionRepository;
        private final SessionStaffAssignmentService assignmentService;

        @Transactional
        public RegistrationResponse register(Long sessionId, RegistrationRequest request,
                        Authentication authentication) {
                verifyCanManageSession(sessionId, authentication);
                Session session = sessionRepository
                                .findByIdForUpdate(sessionId)
                                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

                String email = request.getEmail()
                                .toLowerCase()
                                .trim();

                registrationRepository
                                .findBySessionIdAndEmail(sessionId, email)
                                .ifPresent(existing -> {
                                        if (existing.getStatus() == RegistrationStatus.RESERVED ||
                                                        existing.getStatus() == RegistrationStatus.CONFIRMED) {

                                                throw new IllegalArgumentException(
                                                                "You are already registered for this session");
                                        }
                                });

                long activeRegistrations = registrationRepository.countBySessionIdAndStatusIn(
                                sessionId,
                                List.of(RegistrationStatus.RESERVED, RegistrationStatus.CONFIRMED,
                                                RegistrationStatus.CHECKED_IN));

                if (activeRegistrations >= session.getCapacity()) {
                        throw new CapacityExceededException(
                                        "This session is full");
                }

                LocalDateTime now = LocalDateTime.now();

                Registration registration = Registration.builder()
                                .session(session)
                                .name(request.getName().trim())
                                .email(email)
                                .status(RegistrationStatus.RESERVED)
                                .confirmationCode(generateConfirmationCode())
                                .reservedAt(now)
                                .expiresAt(now.plusMinutes(5))
                                .build();

                return toResponse(registrationRepository.save(registration));
        }

        @Transactional
        public RegistrationResponse confirm(String confirmationCode, Authentication authentication) {

                Registration registration = registrationRepository
                                .findByConfirmationCode(confirmationCode)
                                .orElseThrow(() -> new RegistrationNotFoundException(
                                                "Registration not found"));
                verifyCanManageSession(registration.getSession().getId(), authentication);

                if (registration.getStatus() != RegistrationStatus.RESERVED) {
                        throw new IllegalArgumentException("Registration cannot be confirmed");
                }

                if (registration.getExpiresAt()
                                .isBefore(LocalDateTime.now())) {

                        registration.setStatus(
                                        RegistrationStatus.EXPIRED);

                        registrationRepository.save(registration);

                        throw new IllegalArgumentException("Reservation has expired");
                }

                registration.setStatus(
                                RegistrationStatus.CONFIRMED);

                registration.setConfirmedAt(
                                LocalDateTime.now());

                return toResponse(
                                registrationRepository.save(registration));
        }

        private String generateConfirmationCode() {
                return UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 8)
                                .toUpperCase();
        }

        private RegistrationResponse toResponse(Registration registration) {

                return RegistrationResponse.builder()
                                .id(registration.getId())
                                .sessionId(registration.getSession().getId())
                                .name(registration.getName())
                                .email(registration.getEmail())
                                .status(registration.getStatus())
                                .confirmationCode(
                                                registration.getConfirmationCode())
                                .expiresAt(registration.getExpiresAt())
                                .build();
        }

        @Transactional
        public RegistrationResponse cancel(Long id, Authentication authentication) {

                Registration registration = registrationRepository.findById(id)
                                .orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));

                verifyCanManageSession(registration.getSession().getId(), authentication);

                if (registration.getStatus() == RegistrationStatus.CANCELLED) {
                        throw new IllegalArgumentException("Registration is already cancelled");
                }

                registration.setStatus(RegistrationStatus.CANCELLED);

                registration.setCancelledAt(LocalDateTime.now());

                return toResponse(registrationRepository.save(registration));
        }

        @Transactional
        public RegistrationResponse checkIn(Long id, Authentication authentication) {

                Registration registration = registrationRepository.findById(id)
                                .orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));

                verifyCanManageSession(registration.getSession().getId(), authentication);

                if (registration.getStatus() != RegistrationStatus.CONFIRMED) {

                        throw new IllegalArgumentException("Only confirmed registrations can be checked in");
                }

                registration.setStatus(RegistrationStatus.CHECKED_IN);

                registration.setCheckedInAt(LocalDateTime.now());

                return toResponse(registrationRepository.save(registration));
        }

        private void verifyCanManageSession(Long sessionId, Authentication authentication) {

                String role = authentication.getAuthorities()
                                .stream()
                                .findFirst()
                                .map(Object::toString)
                                .orElse("");

                if (role.equals("ROLE_ORGANIZER")) {
                        return;
                }

                if (role.equals("ROLE_CHECK_IN_STAFF")) {

                        Long staffId = Long.parseLong(authentication.getName());

                        if (!assignmentService.isAssigned(sessionId, staffId)) {

                                throw new AccessDeniedException("You are not assigned to this session");
                        }

                        return;
                }

                throw new AccessDeniedException("You are not allowed to manage registrations");
        }

        public RegistrationPageResponse getBySession(
                        Long sessionId,
                        Authentication authentication,
                        String search,
                        RegistrationStatus status,
                        String sortBy,
                        String direction,
                        int page,
                        int size) {

                verifyCanManageSession(sessionId, authentication);

                if (search == null) {
                        search = "";
                }

                if (sortBy == null || sortBy.isBlank()) {
                        sortBy = "name";
                }

                if (!sortBy.equals("name")
                                && !sortBy.equals("email")
                                && !sortBy.equals("status")) {

                        sortBy = "name";
                }

                Sort.Direction sortDirection = direction != null &&
                                direction.equalsIgnoreCase("desc")
                                                ? Sort.Direction.DESC
                                                : Sort.Direction.ASC;

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by(sortDirection, sortBy));

                Page<Registration> result;
                long activeRegistrations = registrationRepository.countBySessionIdAndStatusIn(
                                sessionId,
                                List.of(
                                                RegistrationStatus.RESERVED,
                                                RegistrationStatus.CONFIRMED,
                                                RegistrationStatus.CHECKED_IN));

                if (status != null && !search.isBlank()) {
                        result = registrationRepository.searchBySessionAndStatus(
                                        sessionId,
                                        status,
                                        search,
                                        pageable);

                } else if (status != null) {
                        result = registrationRepository.findBySessionIdAndStatus(
                                        sessionId,
                                        status,
                                        pageable);

                } else if (!search.isBlank()) {
                        result = registrationRepository.searchBySession(
                                        sessionId,
                                        search,
                                        pageable);

                } else {
                        result = registrationRepository.findBySessionId(
                                        sessionId,
                                        pageable);
                }

                return RegistrationPageResponse.builder()
                                .content(
                                                result.getContent()
                                                                .stream()
                                                                .map(this::toResponse)
                                                                .toList())
                                .page(result.getNumber())
                                .size(result.getSize())
                                .totalElements(result.getTotalElements())
                                .totalPages(result.getTotalPages())
                                .activeRegistrations(activeRegistrations)
                                .build();
        }
}
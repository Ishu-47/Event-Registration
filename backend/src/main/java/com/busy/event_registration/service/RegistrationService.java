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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final SessionRepository sessionRepository;

    @Transactional
    public RegistrationResponse register(
            Long sessionId,
            RegistrationRequest request) {

        Session session = sessionRepository
                .findByIdForUpdate(sessionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Session not found"));

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
                List.of(
                        RegistrationStatus.RESERVED,
                        RegistrationStatus.CONFIRMED));

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

        return toResponse(
                registrationRepository.save(registration));
    }

    @Transactional
    public RegistrationResponse confirm(String confirmationCode) {

        Registration registration = registrationRepository
                .findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new RegistrationNotFoundException(
                        "Registration not found"));

        if (registration.getStatus() != RegistrationStatus.RESERVED) {
            throw new IllegalArgumentException(
                    "Registration cannot be confirmed");
        }

        if (registration.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            registration.setStatus(
                    RegistrationStatus.EXPIRED);

            registrationRepository.save(registration);

            throw new IllegalArgumentException(
                    "Reservation has expired");
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

    private RegistrationResponse toResponse(
            Registration registration) {

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
    public RegistrationResponse cancel(Long id) {

        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RegistrationNotFoundException(
                        "Registration not found"));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Registration is already cancelled");
        }

        registration.setStatus(
                RegistrationStatus.CANCELLED);

        registration.setCancelledAt(
                LocalDateTime.now());

        return toResponse(
                registrationRepository.save(registration));
    }
}
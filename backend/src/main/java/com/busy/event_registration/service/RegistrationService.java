package com.busy.event_registration.service;

import com.busy.event_registration.dto.CsvImportResponse;
import com.busy.event_registration.dto.RegistrationHistoryResponse;
import com.busy.event_registration.dto.RegistrationPageResponse;
import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.entity.Registration;
import com.busy.event_registration.entity.RegistrationHistory;
import com.busy.event_registration.entity.RegistrationStatus;
import com.busy.event_registration.entity.Session;
import com.busy.event_registration.exception.CapacityExceededException;
import com.busy.event_registration.exception.RegistrationNotFoundException;
import com.busy.event_registration.repository.RegistrationHistoryRepository;
import com.busy.event_registration.repository.RegistrationRepository;
import com.busy.event_registration.repository.SessionRepository;

import lombok.RequiredArgsConstructor;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService {

        private final RegistrationRepository registrationRepository;
        private final RegistrationHistoryRepository registrationHistoryRepository;
        private final SessionRepository sessionRepository;
        private final SessionStaffAssignmentService assignmentService;

        // =========================
        // REGISTER
        // =========================

        @Transactional
        public RegistrationResponse register(
                        Long sessionId,
                        RegistrationRequest request,
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
                                List.of(
                                                RegistrationStatus.RESERVED,
                                                RegistrationStatus.CONFIRMED,
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

                registration = registrationRepository.save(registration);

                // Initial registration history
                saveHistory(
                                registration,
                                null,
                                RegistrationStatus.RESERVED,
                                authentication,
                                "Registration created");

                return toResponse(registration);
        }

        // =========================
        // CONFIRM
        // =========================

        @Transactional
        public RegistrationResponse confirm(
                        String confirmationCode,
                        Authentication authentication) {

                Registration registration = registrationRepository
                                .findByConfirmationCode(confirmationCode)
                                .orElseThrow(() -> new RegistrationNotFoundException(
                                                "Registration not found"));

                verifyCanManageSession(
                                registration.getSession().getId(),
                                authentication);

                if (registration.getStatus() != RegistrationStatus.RESERVED) {
                        throw new IllegalArgumentException(
                                        "Registration cannot be confirmed");
                }

                if (registration.getExpiresAt()
                                .isBefore(LocalDateTime.now())) {

                        RegistrationStatus oldStatus = registration.getStatus();

                        registration.setStatus(
                                        RegistrationStatus.EXPIRED);

                        registrationRepository.save(registration);

                        saveHistory(
                                        registration,
                                        oldStatus,
                                        RegistrationStatus.EXPIRED,
                                        authentication,
                                        "Reservation expired before confirmation");

                        throw new IllegalArgumentException(
                                        "Reservation has expired");
                }

                RegistrationStatus oldStatus = registration.getStatus();

                registration.setStatus(
                                RegistrationStatus.CONFIRMED);

                registration.setConfirmedAt(
                                LocalDateTime.now());

                registration = registrationRepository.save(registration);

                saveHistory(
                                registration,
                                oldStatus,
                                RegistrationStatus.CONFIRMED,
                                authentication,
                                "Registration confirmed");

                return toResponse(registration);
        }

        // =========================
        // CANCEL
        // =========================

        @Transactional
        public RegistrationResponse cancel(
                        Long id,
                        Authentication authentication) {

                Registration registration = registrationRepository.findById(id)
                                .orElseThrow(() -> new RegistrationNotFoundException(
                                                "Registration not found"));

                verifyCanManageSession(
                                registration.getSession().getId(),
                                authentication);

                if (registration.getStatus() != RegistrationStatus.RESERVED &&
                                registration.getStatus() != RegistrationStatus.CONFIRMED) {

                        throw new IllegalArgumentException(
                                        "Only reserved or confirmed registrations can be cancelled");
                }

                RegistrationStatus oldStatus = registration.getStatus();

                registration.setStatus(
                                RegistrationStatus.CANCELLED);

                registration.setCancelledAt(
                                LocalDateTime.now());

                registration = registrationRepository.save(registration);

                saveHistory(
                                registration,
                                oldStatus,
                                RegistrationStatus.CANCELLED,
                                authentication,
                                "Registration cancelled");

                return toResponse(registration);
        }

        // =========================
        // CHECK IN
        // =========================

        @Transactional
        public RegistrationResponse checkIn(
                        Long id,
                        Authentication authentication) {

                Registration registration = registrationRepository.findById(id)
                                .orElseThrow(() -> new RegistrationNotFoundException(
                                                "Registration not found"));

                verifyCanManageSession(
                                registration.getSession().getId(),
                                authentication);

                if (registration.getStatus() != RegistrationStatus.CONFIRMED) {

                        throw new IllegalArgumentException(
                                        "Only confirmed registrations can be checked in");
                }

                RegistrationStatus oldStatus = registration.getStatus();

                registration.setStatus(
                                RegistrationStatus.CHECKED_IN);

                registration.setCheckedInAt(
                                LocalDateTime.now());

                registration = registrationRepository.save(registration);

                saveHistory(
                                registration,
                                oldStatus,
                                RegistrationStatus.CHECKED_IN,
                                authentication,
                                "Attendee checked in");

                return toResponse(registration);
        }

        // =========================
        // CSV IMPORT
        // =========================

        @Transactional
        public CsvImportResponse importCsv(
                        Long sessionId,
                        MultipartFile file,
                        Authentication authentication) {

                verifyCanManageSession(sessionId, authentication);

                Session session = sessionRepository
                                .findByIdForUpdate(sessionId)
                                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

                if (file.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "CSV file is empty");
                }

                int imported = 0;
                int failed = 0;

                long activeRegistrations = registrationRepository.countBySessionIdAndStatusIn(
                                sessionId,
                                List.of(
                                                RegistrationStatus.RESERVED,
                                                RegistrationStatus.CONFIRMED,
                                                RegistrationStatus.CHECKED_IN));

                List<String> errors = new ArrayList<>();

                try (
                                CSVParser parser = CSVParser.parse(
                                                file.getInputStream(),
                                                StandardCharsets.UTF_8,
                                                CSVFormat.DEFAULT.builder()
                                                                .setHeader()
                                                                .setSkipHeaderRecord(true)
                                                                .setIgnoreHeaderCase(true)
                                                                .setTrim(true)
                                                                .get())) {

                        for (CSVRecord record : parser) {

                                long rowNumber = record.getRecordNumber() + 1;

                                String name = record.get("name");
                                String email = record.get("email");

                                if (name == null || name.isBlank()) {
                                        errors.add(
                                                        "Row " + rowNumber +
                                                                        ": Name is required");
                                        failed++;
                                        continue;
                                }

                                if (email == null ||
                                                email.isBlank() ||
                                                !email.matches(
                                                                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

                                        errors.add(
                                                        "Row " + rowNumber +
                                                                        ": Invalid email");
                                        failed++;
                                        continue;
                                }

                                email = email.toLowerCase().trim();

                                if (registrationRepository
                                                .findBySessionIdAndEmail(
                                                                sessionId,
                                                                email)
                                                .isPresent()) {

                                        errors.add(
                                                        "Row " + rowNumber +
                                                                        ": Duplicate email - " +
                                                                        email);

                                        failed++;
                                        continue;
                                }

                                if (activeRegistrations >= session.getCapacity()) {

                                        errors.add(
                                                        "Row " + rowNumber +
                                                                        ": Session capacity exceeded");

                                        failed++;
                                        continue;
                                }

                                LocalDateTime now = LocalDateTime.now();

                                Registration registration = Registration.builder()
                                                .session(session)
                                                .name(name.trim())
                                                .email(email)
                                                .status(
                                                                RegistrationStatus.RESERVED)
                                                .confirmationCode(
                                                                generateConfirmationCode())
                                                .reservedAt(now)
                                                .expiresAt(
                                                                now.plusMinutes(5))
                                                .build();

                                registration = registrationRepository.save(
                                                registration);

                                saveHistory(
                                                registration,
                                                null,
                                                RegistrationStatus.RESERVED,
                                                authentication,
                                                "Registration created via CSV import");

                                imported++;
                                activeRegistrations++;
                        }

                } catch (IOException e) {

                        throw new IllegalArgumentException(
                                        "Unable to read CSV file");
                }

                return CsvImportResponse.builder()
                                .imported(imported)
                                .failed(failed)
                                .errors(errors)
                                .build();
        }

        // =========================
        // CSV EXPORT
        // =========================

        @Transactional(readOnly = true)
        public String exportCsv(
                        Long sessionId,
                        Authentication authentication) {

                verifyCanManageSession(
                                sessionId,
                                authentication);

                List<Registration> registrations = registrationRepository
                                .findBySessionId(sessionId);

                StringWriter writer = new StringWriter();

                try (
                                CSVPrinter printer = new CSVPrinter(
                                                writer,
                                                CSVFormat.DEFAULT.builder()
                                                                .setHeader(
                                                                                "name",
                                                                                "email",
                                                                                "status",
                                                                                "confirmationCode")
                                                                .get())) {

                        for (Registration registration : registrations) {

                                printer.printRecord(
                                                registration.getName(),
                                                registration.getEmail(),
                                                registration.getStatus(),
                                                registration.getConfirmationCode());
                        }

                } catch (IOException e) {

                        throw new IllegalStateException(
                                        "Unable to create CSV file");
                }

                return writer.toString();
        }

        // =========================
        // GET REGISTRATIONS
        // =========================

        public RegistrationPageResponse getBySession(
                        Long sessionId,
                        Authentication authentication,
                        String search,
                        RegistrationStatus status,
                        String sortBy,
                        String direction,
                        int page,
                        int size) {

                verifyCanManageSession(
                                sessionId,
                                authentication);

                if (search == null) {
                        search = "";
                }

                if (sortBy == null || sortBy.isBlank()) {
                        sortBy = "name";
                }

                if (!sortBy.equals("name") &&
                                !sortBy.equals("email") &&
                                !sortBy.equals("status")) {

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

                long activeRegistrations = registrationRepository
                                .countBySessionIdAndStatusIn(
                                                sessionId,
                                                List.of(
                                                                RegistrationStatus.RESERVED,
                                                                RegistrationStatus.CONFIRMED,
                                                                RegistrationStatus.CHECKED_IN));

                if (status != null &&
                                !search.isBlank()) {

                        result = registrationRepository
                                        .searchBySessionAndStatus(
                                                        sessionId,
                                                        status,
                                                        search,
                                                        pageable);

                } else if (status != null) {

                        result = registrationRepository
                                        .findBySessionIdAndStatus(
                                                        sessionId,
                                                        status,
                                                        pageable);

                } else if (!search.isBlank()) {

                        result = registrationRepository
                                        .searchBySession(
                                                        sessionId,
                                                        search,
                                                        pageable);

                } else {

                        result = registrationRepository
                                        .findBySessionId(
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
                                .totalElements(
                                                result.getTotalElements())
                                .totalPages(
                                                result.getTotalPages())
                                .activeRegistrations(
                                                activeRegistrations)
                                .build();
        }

        // =========================
        // HISTORY
        // =========================

        private void saveHistory(
                        Registration registration,
                        RegistrationStatus oldStatus,
                        RegistrationStatus newStatus,
                        Authentication authentication,
                        String notes) {

                Long performedBy = null;

                if (authentication != null &&
                                authentication.getName() != null) {

                        performedBy = Long.parseLong(
                                        authentication.getName());
                }

                RegistrationHistory history = RegistrationHistory.builder()
                                .registration(registration)
                                .oldStatus(oldStatus)
                                .newStatus(newStatus)
                                .performedBy(performedBy)
                                .notes(notes)
                                .createdAt(
                                                LocalDateTime.now())
                                .build();

                registrationHistoryRepository.save(history);
        }

        // =========================
        // AUTHORIZATION
        // =========================

        private void verifyCanManageSession(
                        Long sessionId,
                        Authentication authentication) {

                String role = authentication
                                .getAuthorities()
                                .stream()
                                .findFirst()
                                .map(Object::toString)
                                .orElse("");

                if (role.equals("ROLE_ORGANIZER")) {
                        return;
                }

                if (role.equals("ROLE_CHECK_IN_STAFF")) {

                        Long staffId = Long.parseLong(
                                        authentication.getName());

                        if (!assignmentService.isAssigned(
                                        sessionId,
                                        staffId)) {

                                throw new AccessDeniedException(
                                                "You are not assigned to this session");
                        }

                        return;
                }

                throw new AccessDeniedException(
                                "You are not allowed to manage registrations");
        }

        // =========================
        // HELPERS
        // =========================

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
                                .sessionId(
                                                registration.getSession().getId())
                                .name(registration.getName())
                                .email(registration.getEmail())
                                .status(registration.getStatus())
                                .confirmationCode(
                                                registration.getConfirmationCode())
                                .expiresAt(
                                                registration.getExpiresAt())
                                .build();
        }

        public List<RegistrationHistoryResponse> getHistory(
                        Long registrationId,
                        Authentication authentication) {

                Registration registration = registrationRepository
                                .findById(registrationId)
                                .orElseThrow(() -> new RegistrationNotFoundException(
                                                "Registration not found"));

                verifyCanManageSession(
                                registration.getSession().getId(),
                                authentication);

                return registrationHistoryRepository
                                .findByRegistrationIdOrderByCreatedAtAsc(registrationId)
                                .stream()
                                .map(history -> RegistrationHistoryResponse.builder()
                                                .id(history.getId())
                                                .oldStatus(history.getOldStatus())
                                                .newStatus(history.getNewStatus())
                                                .performedBy(history.getPerformedBy())
                                                .notes(history.getNotes())
                                                .createdAt(history.getCreatedAt())
                                                .build())
                                .toList();
        }
}
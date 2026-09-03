package com.busy.event_registration.controller;

import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.busy.event_registration.dto.CsvImportResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.busy.event_registration.dto.RegistrationHistoryResponse;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.busy.event_registration.dto.RegistrationPageResponse;
import com.busy.event_registration.entity.RegistrationStatus;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/sessions/{sessionId}")
    public RegistrationResponse register(@PathVariable Long sessionId,
            @Valid @RequestBody RegistrationRequest request, Authentication authentication) {

        return registrationService.register(sessionId, request, authentication);
    }

    @PostMapping("/{confirmationCode}/confirm")
    public RegistrationResponse confirm(@PathVariable String confirmationCode, Authentication authentication) {

        return registrationService.confirm(confirmationCode, authentication);
    }

    @PostMapping("/{id}/cancel")
    public RegistrationResponse cancel(@PathVariable Long id, Authentication authentication) {

        return registrationService.cancel(id, authentication);
    }

    @PostMapping("/{id}/check-in")
    public RegistrationResponse checkIn(@PathVariable Long id, Authentication authentication) {
        return registrationService.checkIn(id, authentication);
    }

    @GetMapping("/sessions/{sessionId}")
    public RegistrationPageResponse getBySession(
            @PathVariable Long sessionId,
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return registrationService.getBySession(
                sessionId,
                authentication,
                search,
                status,
                sortBy,
                direction,
                page,
                size);
    }

    @PostMapping(value = "/sessions/{sessionId}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CsvImportResponse importCsv(
            @PathVariable Long sessionId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        return registrationService.importCsv(
                sessionId,
                file,
                authentication);
    }

    @GetMapping("/sessions/{sessionId}/export")
    public ResponseEntity<byte[]> exportCsv(
            @PathVariable Long sessionId,
            Authentication authentication) {

        String csv = registrationService.exportCsv(
                sessionId,
                authentication);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"session-"
                                + sessionId
                                + "-registrations.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{id}/history")
    public List<RegistrationHistoryResponse> getHistory(
            @PathVariable Long id,
            Authentication authentication) {

        return registrationService.getHistory(
                id,
                authentication);
    }

    @PostMapping("/sessions/{sessionId}/capacity-alert/dismiss")
    public ResponseEntity<Void> dismissCapacityAlert(
            @PathVariable Long sessionId,
            Authentication authentication) {

        registrationService.dismissCapacityAlert(
                sessionId,
                authentication);

        return ResponseEntity.noContent().build();
    }
}
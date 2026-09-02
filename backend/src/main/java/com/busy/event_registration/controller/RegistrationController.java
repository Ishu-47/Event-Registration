package com.busy.event_registration.controller;

import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

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
}
package com.busy.event_registration.controller;

import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public List<RegistrationResponse> getBySession(
            @PathVariable Long sessionId,
            Authentication authentication) {

        return registrationService.getBySession(
                sessionId,
                authentication);
    }
}
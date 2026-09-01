package com.busy.event_registration.controller;

import com.busy.event_registration.dto.RegistrationRequest;
import com.busy.event_registration.dto.RegistrationResponse;
import com.busy.event_registration.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/sessions/{sessionId}")
    public RegistrationResponse register(@PathVariable Long sessionId,
            @Valid @RequestBody RegistrationRequest request) {

        return registrationService.register(sessionId, request);
    }

    @PostMapping("/{confirmationCode}/confirm")
    public RegistrationResponse confirm(
            @PathVariable String confirmationCode) {

        return registrationService.confirm(
                confirmationCode);
    }

    @PostMapping("/{id}/cancel")
    public RegistrationResponse cancel(@PathVariable Long id) {

        return registrationService.cancel(id);
    }
}
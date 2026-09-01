package com.busy.event_registration.controller;

import com.busy.event_registration.dto.InvitationResponse;
import com.busy.event_registration.service.InvitationService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZER')")
    public InvitationResponse createOrganizerInvitation(@RequestParam @NotBlank @Email String email) {

        return invitationService.createOrganizerInvitation(email);
    }
}
package com.busy.event_registration.service;

import com.busy.event_registration.dto.InvitationResponse;
import com.busy.event_registration.entity.Invitation;
import com.busy.event_registration.entity.Role;
import com.busy.event_registration.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;

    public InvitationResponse createOrganizerInvitation(String email) {

        String token = UUID.randomUUID().toString();

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);

        Invitation invitation = Invitation.builder()
                .token(token)
                .email(email.toLowerCase().trim())
                .role(Role.ORGANIZER)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        invitationRepository.save(invitation);

        String registrationLink = "https://event-registration-jet.vercel.app/register?invite=" + token;

        return new InvitationResponse(invitation.getEmail(), token, registrationLink, expiresAt);
    }
}

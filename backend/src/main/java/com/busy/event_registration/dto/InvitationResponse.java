package com.busy.event_registration.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InvitationResponse {
    
    private String email;
    private String invitationToken;
    private String registrationLink;
    private LocalDateTime expiresAt;
}

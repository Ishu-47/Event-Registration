package com.busy.event_registration.dto;

import com.busy.event_registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RegistrationResponse {

    private Long id;
    private Long sessionId;
    private String name;
    private String email;
    private RegistrationStatus status;
    private String confirmationCode;
    private LocalDateTime expiresAt;
}
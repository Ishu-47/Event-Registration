package com.busy.event_registration.dto;

import com.busy.event_registration.entity.RegistrationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RegistrationHistoryResponse {

    private Long id;
    private RegistrationStatus oldStatus;
    private RegistrationStatus newStatus;
    private Long performedBy;
    private String notes;
    private LocalDateTime createdAt;
}
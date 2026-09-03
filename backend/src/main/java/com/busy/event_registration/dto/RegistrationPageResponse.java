package com.busy.event_registration.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RegistrationPageResponse {

    private List<RegistrationResponse> content;

    private int page;
    private int size;

    private long totalElements;
    private int totalPages;

    private long activeRegistrations;

    private boolean atCapacity;
    private boolean capacityAlertVisible;
}
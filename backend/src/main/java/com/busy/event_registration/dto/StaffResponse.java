package com.busy.event_registration.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StaffResponse {

    private Long id;
    private String name;
    private String email;
}
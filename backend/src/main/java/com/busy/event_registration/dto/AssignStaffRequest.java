package com.busy.event_registration.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignStaffRequest {

    @NotNull
    private Long staffId;
}
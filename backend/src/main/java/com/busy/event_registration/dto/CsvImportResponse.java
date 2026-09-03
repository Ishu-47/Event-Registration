package com.busy.event_registration.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CsvImportResponse {

    private int imported;
    private int failed;
    private List<String> errors;
}
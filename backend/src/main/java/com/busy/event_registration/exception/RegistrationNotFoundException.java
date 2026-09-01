package com.busy.event_registration.exception;

public class RegistrationNotFoundException extends RuntimeException {

    public RegistrationNotFoundException(String message) {
        super(message);
    }
}
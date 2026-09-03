package com.busy.event_registration.controller;

import com.busy.event_registration.dto.SessionRequest;
import com.busy.event_registration.dto.SessionResponse;
import com.busy.event_registration.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/events/{eventId}/sessions")
    @PreAuthorize("hasRole('ORGANIZER')")
    public SessionResponse create(@PathVariable Long eventId, @Valid @RequestBody SessionRequest request) {
        return sessionService.create(eventId, request);
    }

    @GetMapping("/events/{eventId}/sessions")
    
    public List<SessionResponse> getByEvent(@PathVariable Long eventId) {
        return sessionService.getByEvent(eventId);
    }

    @GetMapping("/sessions/{id}")
    public SessionResponse getById(@PathVariable Long id) {
        return sessionService.getById(id);
    }

    @PutMapping("/sessions/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public SessionResponse update(@PathVariable Long id, @Valid @RequestBody SessionRequest request) {
        return sessionService.update(id, request);
    }

    @DeleteMapping("/sessions/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public void delete(@PathVariable Long id) {
        sessionService.delete(id);
    }

    @GetMapping("/sessions/my-sessions")
    @PreAuthorize("hasRole('CHECK_IN_STAFF')")
    public List<SessionResponse> getMySessions(Authentication authentication) {

        Long staffId = Long.parseLong(authentication.getName());

        return sessionService.getMySessions(staffId);
    }
}
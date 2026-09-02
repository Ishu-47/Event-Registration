package com.busy.event_registration.controller;

import com.busy.event_registration.dto.AssignStaffRequest;
import com.busy.event_registration.dto.StaffResponse;
import com.busy.event_registration.entity.Role;
import com.busy.event_registration.repository.UserRepository;
import com.busy.event_registration.service.SessionStaffAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionStaffAssignmentController {

    private final SessionStaffAssignmentService assignmentService;
    private final UserRepository userRepository;

    @PostMapping("/{sessionId}/staff")
    @PreAuthorize("hasRole('ORGANIZER')")
    public StaffResponse assign(@PathVariable Long sessionId, @Valid @RequestBody AssignStaffRequest request) {

        return assignmentService.assign(sessionId, request.getStaffId());
    }

    @GetMapping("/{sessionId}/staff")
    @PreAuthorize("hasRole('ORGANIZER')")
    public List<StaffResponse> getAssignedStaff(@PathVariable Long sessionId) {

        return assignmentService.getAssignedStaff(sessionId);
    }

    @DeleteMapping("/{sessionId}/staff/{staffId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public void remove(@PathVariable Long sessionId, @PathVariable Long staffId) {

        assignmentService.remove(sessionId, staffId);
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ORGANIZER')")
    public List<StaffResponse> getAllStaff() {

        return userRepository.findByRole(Role.CHECK_IN_STAFF)
                .stream()
                .map(user -> StaffResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .build())
                .toList();
    }
}
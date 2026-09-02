package com.busy.event_registration.service;

import com.busy.event_registration.dto.StaffResponse;
import com.busy.event_registration.entity.Role;
import com.busy.event_registration.entity.Session;
import com.busy.event_registration.entity.SessionStaffAssignment;
import com.busy.event_registration.entity.User;
import com.busy.event_registration.repository.SessionRepository;
import com.busy.event_registration.repository.SessionStaffAssignmentRepository;
import com.busy.event_registration.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionStaffAssignmentService {

    private final SessionStaffAssignmentRepository assignmentRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    public StaffResponse assign(Long sessionId, Long staffId) {

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        if (staff.getRole() != Role.CHECK_IN_STAFF) {
            throw new IllegalArgumentException("Only check-in staff can be assigned");
        }

        if (assignmentRepository.existsBySessionIdAndStaffId(sessionId, staffId)) {

            throw new IllegalArgumentException("Staff member is already assigned");
        }

        SessionStaffAssignment assignment = SessionStaffAssignment.builder()
                .session(session)
                .staff(staff)
                .build();

        assignmentRepository.save(assignment);

        return toResponse(staff);
    }

    public List<StaffResponse> getAssignedStaff(Long sessionId) {

        return assignmentRepository
                .findBySessionId(sessionId)
                .stream()
                .map(assignment -> toResponse(assignment.getStaff()))
                .toList();
    }

    public void remove(Long sessionId, Long staffId) {

        assignmentRepository
                .deleteBySessionIdAndStaffId(
                        sessionId,
                        staffId);
    }

    public boolean isAssigned(Long sessionId, Long staffId) {

        return assignmentRepository
                .existsBySessionIdAndStaffId(sessionId, staffId);
    }

    private StaffResponse toResponse(User staff) {

        return StaffResponse.builder()
                .id(staff.getId())
                .name(staff.getName())
                .email(staff.getEmail())
                .build();
    }
}
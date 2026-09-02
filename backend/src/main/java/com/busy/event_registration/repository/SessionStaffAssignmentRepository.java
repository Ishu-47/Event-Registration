package com.busy.event_registration.repository;

import com.busy.event_registration.entity.SessionStaffAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionStaffAssignmentRepository extends JpaRepository<SessionStaffAssignment, Long> {

    boolean existsBySessionIdAndStaffId(Long sessionId, Long staffId);

    List<SessionStaffAssignment> findBySessionId(Long sessionId);

    List<SessionStaffAssignment> findByStaffId(Long staffId);

    void deleteBySessionIdAndStaffId(Long sessionId, Long staffId);
}
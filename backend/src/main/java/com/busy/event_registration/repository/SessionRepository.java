package com.busy.event_registration.repository;

import com.busy.event_registration.entity.Session;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByEventId(Long eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s
            FROM Session s
            WHERE s.id = :id
            """)
    Optional<Session> findByIdForUpdate(@Param("id") Long id);
}
package com.busy.event_registration.repository;

import com.busy.event_registration.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByEventId(Long eventId);
}
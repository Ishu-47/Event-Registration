package com.busy.event_registration.repository;

import com.busy.event_registration.entity.RegistrationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationHistoryRepository
        extends JpaRepository<RegistrationHistory, Long> {

    List<RegistrationHistory> findByRegistrationIdOrderByCreatedAtAsc(
            Long registrationId);
}

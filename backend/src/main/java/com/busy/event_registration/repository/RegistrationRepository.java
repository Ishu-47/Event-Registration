package com.busy.event_registration.repository;

import com.busy.event_registration.entity.Registration;
import com.busy.event_registration.entity.RegistrationStatus;
// import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findBySessionIdAndEmail(Long sessionId, String email);

    List<Registration> findBySessionId(Long sessionId);

    Optional<Registration> findByConfirmationCode(String confirmationCode);

    long countBySessionIdAndStatusIn(Long sessionId, List<RegistrationStatus> statuses);

    @Query("""
    SELECT r
    FROM Registration r
    WHERE r.status IN :statuses
    """)
List<Registration> findActiveRegistrations(
        @Param("statuses")
        List<RegistrationStatus> statuses
);
}
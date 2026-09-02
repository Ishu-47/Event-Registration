package com.busy.event_registration.repository;

import com.busy.event_registration.entity.Registration;
import com.busy.event_registration.entity.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findBySessionIdAndEmail(Long sessionId, String email);

    Page<Registration> findBySessionId(Long sessionId, Pageable pageable);

    Page<Registration> findBySessionIdAndStatus(Long sessionId, RegistrationStatus status, Pageable pageable);

    @Query("""
                SELECT r
                FROM Registration r
                WHERE r.session.id = :sessionId
                AND (
                    LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(r.email) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Registration> searchBySession(@Param("sessionId") Long sessionId, @Param("search") String search,
            Pageable pageable);

    @Query("""
                SELECT r
                FROM Registration r
                WHERE r.session.id = :sessionId
                AND r.status = :status
                AND (
                    LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(r.email) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Registration> searchBySessionAndStatus(
            @Param("sessionId") Long sessionId,
            @Param("status") RegistrationStatus status,
            @Param("search") String search,
            Pageable pageable);

    Optional<Registration> findByConfirmationCode(String confirmationCode);

    long countBySessionIdAndStatusIn(Long sessionId, List<RegistrationStatus> statuses);

    @Query("""
                SELECT r
                FROM Registration r
                WHERE r.status IN :statuses
            """)
    List<Registration> findActiveRegistrations(@Param("statuses") List<RegistrationStatus> statuses);
}
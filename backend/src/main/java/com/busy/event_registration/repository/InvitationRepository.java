package com.busy.event_registration.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.busy.event_registration.entity.Invitation;

import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByToken(String token);
}
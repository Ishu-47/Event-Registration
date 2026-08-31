package com.busy.event_registration.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.busy.event_registration.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}

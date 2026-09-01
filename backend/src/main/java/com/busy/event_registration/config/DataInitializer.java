package com.busy.event_registration.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.busy.event_registration.entity.Role;
import com.busy.event_registration.entity.User;
import com.busy.event_registration.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args){
         if (userRepository.findByEmail("organizer@test.com").isEmpty()) {

            User organizer = User.builder()
                    .name("Demo Organizer")
                    .email("organizer@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ORGANIZER)
                    .build();

            userRepository.save(organizer);
        }
    }
}

package com.busy.event_registration.service;

import com.busy.event_registration.entity.Registration;
import com.busy.event_registration.entity.RegistrationStatus;
import com.busy.event_registration.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationExpirationService {

    private final RegistrationRepository registrationRepository;

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void expireReservations() {

        List<Registration> registrations = registrationRepository
                .findActiveRegistrations(List.of(RegistrationStatus.RESERVED));

        LocalDateTime now = LocalDateTime.now();

        registrations.stream()
                .filter(registration -> registration.getExpiresAt().isBefore(now))
                .forEach(registration -> {
                    registration.setStatus(RegistrationStatus.EXPIRED);
                    registrationRepository.save(registration);
                });
    }
}
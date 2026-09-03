package com.busy.event_registration.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus newStatus;

    @Column(nullable = false)
    private Long performedBy;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
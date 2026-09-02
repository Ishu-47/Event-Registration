package com.busy.event_registration.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_staff_assignments", uniqueConstraints = {
        @UniqueConstraint(name = "uk_session_staff", columnNames = { "session_id", "staff_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionStaffAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private User staff;
}
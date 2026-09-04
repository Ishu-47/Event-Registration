# Architecture and Design Decisions

## Overview

The project was developed with a focus on completing the ten mandatory requirements while keeping the implementation understandable and practical.

The following decisions document the important design choices made during development, the alternatives considered, and the reasoning behind them.

## Decision 1 — Use React, Spring Boot, and PostgreSQL

### Chosen

React was used for the frontend, Spring Boot for the backend, and PostgreSQL for persistence.

### Alternatives Considered

Other full-stack combinations could have been used, including a Node.js backend or a different relational database.

### Why

This stack was familiar and allowed the application to be developed quickly without spending time learning a new technology stack.

Spring Boot also provided built-in support for:

- REST APIs
- Spring Security
- JWT integration
- Spring Data JPA
- Scheduling
- Validation

PostgreSQL was chosen because the application has clear relational relationships between users, events, sessions, registrations, staff assignments, and history.

## Decision 2 — Enforce Authorization on the Server

### Chosen

Role and session-access checks are enforced in the Spring Boot backend.

### Alternatives Considered

One alternative was to rely mainly on the React frontend to hide controls that a user should not access.

### Why

Frontend restrictions can be bypassed by directly calling the API.

The assignment explicitly requires authorization to be enforced on the server.

Therefore:

- Organizers can manage events and sessions.
- Check-in staff cannot create events or sessions or change capacity.
- Check-in staff can manage registrations only for sessions assigned to them.

The frontend still hides or changes controls for usability, but the backend remains the actual security boundary.

## Decision 3 — Use JWT for Authentication

### Chosen

JWT-based authentication was used for authenticated API requests.

### Alternatives Considered

A traditional server-side session approach could have been used.

### Why

The application is split into a React frontend and a REST API. JWT works naturally with this architecture because the frontend can include the token with API requests without requiring the backend to maintain a browser session.

It also keeps authentication logic separate from the individual API requests.

## Decision 4 — Model Staff Assignment as a Separate Table

### Chosen

A separate `session_staff_assignments` table was created.

### Alternatives Considered

Staff information could have been stored directly on the session, but that would limit a session to a single staff member.

### Why

The requirement allows multiple staff members to work on sessions.

The chosen model supports both:

- One session → many staff members
- One staff member → many sessions

This is a many-to-many relationship, so a separate join table is the natural relational representation.

## Decision 5 — Use Pessimistic Locking for Capacity

### Chosen

A pessimistic database lock is used when performing capacity-sensitive registration operations.

### Alternatives Considered

A simple application-level count followed by an insert was considered.

### Why

A simple count is unsafe under concurrent requests.

For example, if a session has one remaining seat and two requests arrive at almost the same time, both requests could observe one available seat and both create registrations.

Locking the session while checking capacity and creating the registration prevents this race condition.

The trade-off is reduced concurrency for operations involving the same session, but correctness is more important for capacity enforcement.

## Decision 6 — Derive Occupied Capacity from Registrations

### Chosen

The application calculates occupied capacity from registrations with active statuses.

The statuses that occupy capacity are:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`

### Alternatives Considered

A separate `occupied_count` value could have been stored on the session.

### Why

A stored counter can become inconsistent when registrations are cancelled, expire, or change state.

Deriving the value avoids having two sources of truth.

The trade-off is additional database work when calculating capacity, which is acceptable for the expected scale of the assignment.

## Decision 7 — Use a Separate Registration History Table

### Chosen

Registration history is stored separately from the current registration.

### Alternatives Considered

The application could have stored only the current registration status.

Another option would have been to overwrite the registration record whenever its state changed.

### Why

The assignment requires an immutable registration timeline.

A separate history table allows the application to record:

- Old status
- New status
- Who performed the action
- Notes
- Timestamp

The current registration remains optimized for retrieving the current state, while the history provides the audit trail.

## Decision 8 — Store Attendee Information on Registration

### Chosen

Attendee `name` and `email` are stored directly on the registration.

### Alternatives Considered

A separate `attendees` table could have been introduced and registrations could reference it.

### Why

The assignment does not require a separate attendee account or attendee lifecycle.

The registration is naturally session-specific.

Keeping the attendee information directly on the registration keeps the schema simpler and avoids introducing additional relationships that are not required.

## Decision 9 — Use Server-Side Search and Pagination

### Chosen

Registration search, filtering, sorting, and pagination are handled by the backend.

### Alternatives Considered

The frontend could load all registrations and filter, sort, and paginate them locally.

### Why

Client-side processing would require transferring all registrations to the browser.

Server-side processing reduces the amount of data transferred and allows the database to perform the query.

It also provides a better foundation for handling larger datasets.

## Decision 10 — Process CSV Import Rows Independently

### Chosen

CSV import validates and processes rows independently.

### Alternatives Considered

The entire import could have been rejected if one row was invalid.

### Why

The requirement states that valid rows should still be imported when other rows contain errors.

Independent row processing provides better feedback to the user and prevents one bad record from blocking an otherwise valid import.

The import reports invalid and duplicate rows while continuing with valid rows.

## Decision 11 — Use Scheduled Expiration for Reserved Registrations

### Chosen

A Spring scheduled process automatically changes expired `RESERVED` registrations to `EXPIRED`.

### Alternatives Considered

Reservations could remain reserved until a user explicitly cancelled them.

Another approach would be to check expiration only when someone accesses the registration.

### Why

A reservation should not continue consuming capacity after its holding period.

A scheduled process provides a straightforward way to release expired reservations even when no user is actively viewing that registration.

## Decision 12 — Keep History Read-Only

### Chosen

Registration history is exposed as a read-only timeline.

### Alternatives Considered

Administrators could have been given the ability to edit or delete history entries.

### Why

History exists specifically to provide an audit trail.

Allowing arbitrary modification or deletion would reduce the reliability of that audit trail.

Therefore, the application only creates and reads history records.

## Decision 13 — Use Role-Specific Frontend Views

### Chosen

The React interface changes based on whether the user is an organizer or check-in staff.

### Alternatives Considered

A single interface containing all controls could have been used, with backend authorization handling invalid actions.

### Why

Although backend authorization is still required, showing irrelevant controls creates a poor user experience.

Role-specific interfaces make the application clearer while the backend continues to enforce the actual permissions.

## Decision 14 — Initial Approach to Registration Access Was Too Frontend-Focused

### Initial Decision

During development, some role-specific behavior was initially handled primarily through frontend visibility.

### Problem

This made the interface appear correct but did not guarantee that the underlying API was protected.

A user could potentially bypass frontend restrictions by making requests directly.

### Reversed Decision

The approach was changed so that authorization became explicitly enforced in the backend.

### Final Decision

The backend became the security boundary.

The frontend is responsible for usability and presentation, while Spring Security and service-level checks enforce:

- Role permissions
- Session assignment
- Registration management access

This was an important correction because the assignment explicitly evaluates server-side authorization.

## Decision 15 — Avoid Optional Features Until Mandatory Goals Were Complete

### Chosen

The ten mandatory goals were treated as the scope cutoff.

### Alternatives Considered

Optional features such as payments, notifications, advanced analytics, and real-time updates could have been implemented earlier.

### Why

The assignment states that completing the ten required goals is more important than partially implementing additional features.

The decision was therefore to prioritize:

1. Correct business rules
2. Security
3. Registration capacity
4. Required workflows
5. Required documentation

Optional functionality was deliberately left out unless time remained after the mandatory requirements.

## Summary

The main architectural decisions were driven by three priorities:

1. **Correctness** — especially around registration state and capacity.
2. **Security** — especially server-side authorization.
3. **Practical scope** — completing the required functionality without unnecessary infrastructure.

Where simplicity and correctness conflicted, correctness was prioritized for important business rules such as capacity and authorization.
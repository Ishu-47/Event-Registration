# Database Schema

## Overview

The application uses PostgreSQL as the relational database.

The database stores users, events, sessions, registrations, staff assignments, registration history, and organizer invitations.

The schema uses primary keys, foreign keys, and unique constraints to maintain data integrity.

Business rules such as registration state transitions, capacity validation, and authorization are handled by the application layer.

## Tables

### users

Stores application users and their roles.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | User's name |
| `email` | VARCHAR | User's email address |
| `password` | VARCHAR | Hashed password |
| `role` | VARCHAR | User role (`ORGANIZER` or `CHECK_IN_STAFF`) |
| `created_at` | TIMESTAMP | Account creation timestamp |

The `email` identifies the user's login account.

The `role` determines the user's authorization level.

### events

Stores events created by organizers.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | Event name |
| `description` | VARCHAR/TEXT | Event description |
| `location` | VARCHAR | Event location |
| `start_date_time` | TIMESTAMP | Event start time |
| `end_date_time` | TIMESTAMP | Event end time |
| `created_at` | TIMESTAMP | Event creation timestamp |

One event can contain multiple sessions.

### sessions

Stores sessions belonging to an event.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `title` | VARCHAR | Session title |
| `description` | VARCHAR/TEXT | Session description |
| `start_date_time` | TIMESTAMP | Session start time |
| `end_date_time` | TIMESTAMP | Session end time |
| `capacity` | INTEGER | Maximum occupied registrations |
| `event_id` | BIGINT | Foreign key referencing `events.id` |

Each session belongs to one event.

One event can have many sessions.

### registrations

Stores attendee registrations for sessions.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `session_id` | BIGINT | Foreign key referencing `sessions.id` |
| `name` | VARCHAR | Attendee name |
| `email` | VARCHAR | Attendee email |
| `status` | VARCHAR | Registration status |
| `confirmation_code` | VARCHAR | Registration confirmation code |
| `reserved_at` | TIMESTAMP | Time the reservation was created |
| `expires_at` | TIMESTAMP | Reservation expiration time |
| `confirmed_at` | TIMESTAMP | Confirmation timestamp |
| `cancelled_at` | TIMESTAMP | Cancellation timestamp |
| `checked_in_at` | TIMESTAMP | Check-in timestamp |

The registration status can be:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`
- `CANCELLED`
- `EXPIRED`

A unique constraint on `session_id` and `email` prevents the same email from being registered more than once for the same session.

### session_staff_assignments

Represents the assignment of check-in staff to sessions.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `session_id` | BIGINT | Foreign key referencing `sessions.id` |
| `staff_id` | BIGINT | Foreign key referencing `users.id` |

A unique constraint on `session_id` and `staff_id` prevents duplicate assignments.

This table represents the many-to-many relationship between sessions and check-in staff.

### registration_history

Stores the history of registration status changes.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `registration_id` | BIGINT | Foreign key referencing `registrations.id` |
| `old_status` | VARCHAR | Previous registration status |
| `new_status` | VARCHAR | New registration status |
| `performed_by` | BIGINT | ID of the user who performed the action |
| `notes` | VARCHAR(500) | Optional notes |
| `created_at` | TIMESTAMP | Time the history entry was created |

`old_status` can be null for the initial registration because there is no previous status.

History records are append-only from the application's perspective. There are no application operations for editing or deleting history entries.

### invitations

Stores organizer invitation information.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Primary key |
| `email` | VARCHAR | Invited email address |
| `token` | VARCHAR | Invitation token |
| `expires_at` | TIMESTAMP | Invitation expiration time |
| `used` | BOOLEAN | Whether the invitation has been used |
| `created_at` | TIMESTAMP | Invitation creation timestamp |

Invitation tokens expire after a defined period and can only be used once.

## Relationships

### Event to Session

This is a one-to-many relationship.

One event can have multiple sessions, while each session belongs to one event.

The relationship is represented by `sessions.event_id`.

### Session to Registration

This is a one-to-many relationship.

One session can have multiple registrations, while each registration belongs to one session.

The relationship is represented by `registrations.session_id`.

### Session to Staff

This is a many-to-many relationship.

One session can have multiple check-in staff members, and one check-in staff member can be assigned to multiple sessions.

The `session_staff_assignments` table is used as the join table.

### Registration to Registration History

This is a one-to-many relationship.

One registration can have multiple history records, while each history record belongs to one registration.

The relationship is represented by `registration_history.registration_id`.

### User to Session Staff Assignment

This is a one-to-many relationship from the user's perspective.

One check-in staff member can have multiple session assignments.

The relationship is represented by `session_staff_assignments.staff_id`.

## Database Constraints

### Primary Keys

Every main table has a generated primary key.

Primary keys uniquely identify records.

### Foreign Keys

Foreign keys are used for the following relationships:

- `sessions.event_id -> events.id`
- `registrations.session_id -> sessions.id`
- `session_staff_assignments.session_id -> sessions.id`
- `session_staff_assignments.staff_id -> users.id`
- `registration_history.registration_id -> registrations.id`

These constraints prevent references to nonexistent parent records.

### Unique Constraints

Important unique constraints include:

- `registrations(session_id, email)`
- `session_staff_assignments(session_id, staff_id)`

These protect against duplicate registrations and duplicate staff assignments.

## Application-Level Constraints

The following business rules are enforced by the application:

- Only organizers can create events.
- Only organizers can archive events.
- Only organizers can create sessions.
- Only organizers can edit sessions.
- Only organizers can delete sessions.
- Only organizers can change session capacity.
- Check-in staff can manage only sessions assigned to them.
- Organizers can manage registrations for any session.
- Registrations can only move through valid lifecycle transitions.
- Only `CONFIRMED` registrations can be checked in.
- `RESERVED` and `CONFIRMED` registrations can be cancelled.
- `CHECKED_IN` registrations cannot be cancelled.
- Only `RESERVED` registrations can expire.
- Session capacity cannot be exceeded.
- Reservations automatically expire after the holding period.
- CSV import rows are validated before being imported.

These rules require business context, so they are implemented in the service and security layers rather than only as database constraints.

## Capacity Representation

Session capacity is stored directly on the `sessions` table as an integer.

The number of occupied registrations is calculated from registrations belonging to the session.

The following statuses occupy capacity:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`

The following statuses do not occupy capacity:

- `CANCELLED`
- `EXPIRED`

The occupied count is derived from registration data instead of being stored as a separate counter.

For capacity-sensitive registration operations, the backend uses a pessimistic lock on the session while checking capacity and creating the registration.

This prevents concurrent requests from both observing the same available capacity and causing overbooking.

## Deliberate Denormalisation

Attendee information is stored directly on the `registrations` table:

- `name`
- `email`

There is no separate attendee table.

This was deliberate because the assignment treats registration as the attendee's session-specific participation record.

The same person can register for multiple sessions, and each registration can therefore contain the attendee information required for that session.

This keeps the model simple and avoids introducing an additional attendee lifecycle that was not required by the assignment.

## Why Capacity Is Not Stored as a Counter

The application does not maintain a separate `occupied_count` column on the session.

Instead, occupied capacity is derived from registrations with active statuses.

For example:

Session capacity: 100

- RESERVED: 10
- CONFIRMED: 70
- CHECKED_IN: 15
- Occupied: 95
- Available: 5

This avoids synchronization problems that could occur if a stored counter became inconsistent after a registration was cancelled, expired, confirmed, or checked in.

The trade-off is that calculating the occupied count requires querying registration records.

## What Would Break First at 100x the Data

At significantly larger scale, registration queries and capacity counting would be the first areas likely to require optimization.

Server-side search, filtering, sorting, and pagination would depend increasingly on appropriate database indexes.

Potential indexes would include:

- `registrations.session_id`
- `registrations.status`
- `registrations.email`
- `registrations(session_id, status)`
- `registration_history.registration_id`
- `session_staff_assignments.staff_id`
- `session_staff_assignments.session_id`

Capacity counting could also become more expensive for sessions with very large numbers of registrations because occupied capacity is derived from registration records.

At much larger scale, a maintained counter or cached aggregate could be considered. However, this would introduce additional consistency and concurrency concerns.

The current design favors correctness and simplicity for the expected assignment scale.

The registration history table would also continue growing because history entries are intentionally retained. At 100x the data volume, indexing, archival policies, and potentially table partitioning could be considered.

## Design Trade-offs

The schema favors a normalized relational design for the main entities while keeping attendee information directly on registrations.

The main trade-offs are:

1. **Derived capacity count instead of a stored counter**

   This avoids synchronization problems but requires querying registrations to calculate occupied capacity.

2. **Separate registration history**

   This increases storage requirements but provides an audit trail of registration state changes.

3. **Separate staff assignment table**

   This adds a table but correctly models the many-to-many relationship between sessions and staff.

4. **Attendee information stored on registration**

   This keeps the model simple and matches the session-specific nature of registration.

5. **Database constraints plus application validation**

   Database constraints protect structural integrity while application services enforce business rules that require workflow context.
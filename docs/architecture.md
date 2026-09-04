# Architecture

## Overview

The application is a full-stack event registration system built with React, Spring Boot, and PostgreSQL.

The React frontend provides the user interface and communicates with the Spring Boot backend through REST APIs. The Spring Boot backend contains the business logic, authentication, authorization, registration lifecycle management, capacity handling, CSV processing, staff assignment, registration history, and scheduled reservation expiry. PostgreSQL provides persistent relational storage.

The main components are:

- React + Tailwind CSS — browser-side user interface
- Spring Boot — REST API and business logic
- Spring Security + JWT — authentication and role-based authorization
- Spring Data JPA / Hibernate — database access
- PostgreSQL — persistent storage
- Spring Scheduling — automatic expiration of reserved registrations

## System Components

### Frontend

The frontend is implemented using React and Tailwind CSS.

It provides pages and interfaces for:

- User login and registration
- Dashboard
- Event management
- Session management
- Session registrations
- Staff assignment
- Registration history
- CSV import and export
- Check-in staff assigned sessions

The frontend communicates with the backend using REST APIs and includes the JWT access token with authenticated requests.

The interface also changes based on the authenticated user's role. For example, organizers receive management controls while check-in staff see the sessions assigned to them.

Frontend restrictions are only for user experience. Security-sensitive authorization is enforced by the backend.

### Backend

The backend is implemented using Spring Boot.

The backend is separated into controllers, services, repositories, entities, DTOs, security components, and exception handling.

The main responsibilities are:

- Authentication and JWT generation/validation
- Role-based authorization
- Event management
- Session management
- Staff assignment
- Registration lifecycle management
- Registration capacity enforcement
- Reservation expiration
- Registration search, filtering, sorting, and pagination
- CSV import and export
- Registration history
- Capacity alerts
- Dashboard data

Controllers expose REST endpoints, while services contain the application and business rules. Repositories use Spring Data JPA to communicate with PostgreSQL.

### Database

PostgreSQL is used as the application's persistent relational database.

The database stores information related to:

- Users
- Events
- Sessions
- Registrations
- Session/staff assignments
- Registration history
- Organizer invitations

Database constraints are used where appropriate, including unique constraints for relationships and registration uniqueness.

Application-level validation is used for business rules such as registration state transitions, authorization, and capacity handling.

## Authentication and Authorization

Users authenticate using an email address and password.

After successful authentication, the backend issues a JWT. The token identifies the authenticated user and provides the information required for role-based authorization.

There are two application roles:

- `ORGANIZER`
- `CHECK_IN_STAFF`

Organizers can:

- Create and archive events
- Create, edit, and delete sessions
- Set and change session capacity
- Manage registrations for any session
- Assign check-in staff to sessions

Check-in staff can manage registrations only for sessions to which they have been assigned.

Check-in staff cannot:

- Create events
- Create sessions
- Change session capacity
- Perform organizer-only management operations

These authorization rules are enforced on the backend using Spring Security rather than relying only on frontend visibility.

Therefore, manually calling a protected API does not allow a user to bypass their role permissions.

## Request Flow

A representative example is creating a registration for a session.

The request flow is:

User
  |
  | 1. Submit registration
  v
React Frontend
  |
  | 2. POST registration request
  |    + JWT
  v
Spring Security
  |
  | 3. Authenticate user
  | 4. Verify authorization
  v
RegistrationController
  |
  | 5. Pass request to service
  v
RegistrationService
  |
  | 6. Load the session
  | 7. Lock the session for capacity-sensitive operation
  | 8. Check for duplicate registration
  | 9. Count occupied registrations
  | 10. Validate session capacity
  | 11. Create RESERVED registration
  | 12. Create registration history entry
  v
JPA / Hibernate
  |
  | 13. Persist changes
  v
PostgreSQL
  |
  | 14. Return saved data
  v
RegistrationService
  |
  | 15. Build response DTO
  v
React Frontend
  |
  | 16. Display updated registration
  v
User

The capacity check is performed on the server.

A pessimistic database lock is used during the capacity-sensitive registration operation so concurrent registration requests cannot independently observe the same available capacity and cause overbooking.

## Registration Lifecycle

Registrations follow a defined state lifecycle.

RESERVED
   |
   +------> CONFIRMED
   |           |
   |           +------> CHECKED_IN
   |
   +------> CANCELLED

CONFIRMED
   |
   +------> CANCELLED

RESERVED
   |
   +------> EXPIRED

The main states are:

- `RESERVED` — a seat is temporarily held for the attendee
- `CONFIRMED` — the registration has been confirmed
- `CHECKED_IN` — the attendee has checked in
- `CANCELLED` — the registration has been cancelled
- `EXPIRED` — the reservation holding period ended before confirmation

Only valid state transitions are allowed by the backend.

Occupied session capacity consists of:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`

The following states do not occupy capacity:

- `CANCELLED`
- `EXPIRED`

Reserved registrations automatically expire after their holding period through a scheduled backend process.

## Staff Assignment

Staff assignments are represented separately from sessions.

This allows:

- One session to have multiple check-in staff members.
- One check-in staff member to be assigned to multiple sessions.

When check-in staff attempts to manage a registration, the backend verifies that the staff member is assigned to the registration's session.

Organizers do not require an assignment because they can manage registrations for any session.

This authorization check is performed server-side.

## Registration History

Registration history is stored separately from the current registration record.

Each history record contains information such as:

- Registration
- Previous status
- New status
- User who performed the action
- Notes
- Timestamp

The initial registration is recorded as a transition from no previous status to `RESERVED`.

Subsequent status changes create additional history records.

The history is exposed as a read-only timeline to users who have access to the registration.

History records are not edited or deleted through the application. This provides an audit trail of the registration lifecycle instead of relying only on the current registration status.

## CSV Processing

CSV import and export are handled by the backend.

For CSV imports, rows are processed independently.

A valid row creates a reservation if:

- The attendee data is valid
- The attendee is not already registered for the session
- Session capacity is available

Invalid or duplicate rows are reported with their reason without preventing other valid rows from being imported.

CSV export provides attendee information for a session, including registration status and confirmation information.

CSV parsing and validation are performed server-side.

## Search, Filtering, Sorting, and Pagination

Registration listing supports server-side:

- Search
- Status filtering
- Sorting
- Pagination

The frontend sends the requested search and pagination parameters to the backend rather than loading all registrations and performing the operations only in the browser.

This keeps the API responsible for registration querying and allows the approach to scale better than client-side filtering of the complete dataset.

## Scheduled Processing

The backend uses Spring Scheduling for automatic reservation expiration.

The scheduled process checks for reservations that have passed their expiration time.

A reservation that remains in the `RESERVED` state after its holding period is changed to `EXPIRED`.

Because expired registrations no longer count toward occupied capacity, their seats become available again.

## Capacity Alerts

The application detects when a session reaches its configured capacity.

When the session becomes full, a capacity alert can be displayed.

An organizer can dismiss the alert.

If capacity becomes available again and the session later becomes full again, the capacity alert can appear again.

This behavior is handled using backend state rather than relying only on the current frontend display.

## Error Handling

The backend uses application-specific exceptions for cases such as:

- Registration not found
- Capacity exceeded
- Invalid registration state transition
- Unauthorized access
- Invalid or expired invitation
- Invalid request data

A global exception handler converts backend exceptions into appropriate HTTP responses.

The frontend uses these responses to display meaningful error messages to the user.

## Deployment Architecture

The application is designed as three logical deployed components:

Internet
   |
   v
React Frontend
Static Hosting
   |
   | HTTPS / REST
   v
Spring Boot API
Server Hosting
   |
   | JDBC
   v
PostgreSQL
Managed Database

The frontend communicates with the publicly accessible Spring Boot API.

The backend connects to PostgreSQL using environment variables for database configuration.

Sensitive values such as:

- Database credentials
- JWT secrets
- API configuration

are kept outside the source code using environment variables.

## What I Deliberately Did Not Build

The implementation focuses on the ten mandatory goals from the assignment rather than adding unnecessary product features.

I deliberately did not build:

- Payment processing
- Email or SMS notification infrastructure
- Social login
- Multi-tenant organization management
- Complex analytics and reporting
- Real-time WebSocket updates
- Mobile applications
- Advanced event discovery or recommendation functionality
- Complex approval workflows

These features could be added later, but they were outside the required scope. Avoiding them allowed the implementation to focus on completing the required functionality reliably.

## Design Principles

The main architectural decisions were driven by correctness, security, and maintainability while keeping the implementation within the assignment's scope.

The important principles are:

1. **Business rules belong on the server.**

   Frontend restrictions are not treated as security boundaries. Authorization and important business rules are enforced by the backend.

2. **Capacity-sensitive operations must be concurrency-safe.**

   Session locking is used when calculating and reserving capacity so concurrent registration requests cannot overbook a session.

3. **Registration state transitions are explicit.**

   The backend allows only valid registration state transitions instead of allowing arbitrary status changes.

4. **Audit history is separate from current registration state.**

   The registration stores the current state while the history stores the sequence of changes over time.

5. **Staff assignments are modeled explicitly.**

   The separate assignment model supports multiple staff members per session and multiple sessions per staff member.

6. **DTOs are used for API responses.**

   API DTOs keep the external API representation separate from the persistence entities.

7. **Database constraints complement application validation.**

   Important data integrity rules are protected at the database level where appropriate, while business workflows remain in the service layer.

8. **The implementation stays within the assignment scope.**

   Additional infrastructure and features were avoided when they were not required to satisfy the ten mandatory goals.
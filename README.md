# Event Registration System

A full-stack event registration platform built as a take-home assignment.

The application allows organizers to create and manage events and sessions, manage attendee registrations, assign check-in staff, track registration history, import/export registrations using CSV, and monitor session capacity.

Check-in staff can manage registrations for sessions they are assigned to.

## Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- JavaScript

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA / Hibernate
- Maven

### Database

- PostgreSQL

### Other

- Apache Commons CSV
- Lombok
- Git / GitHub

## Features

### Authentication and Roles

The application supports two roles:

- `ORGANIZER`
- `CHECK_IN_STAFF`

Organizers can:

- Create and manage events
- Create, edit, and delete sessions
- Configure session capacity
- Manage registrations
- Assign check-in staff

Check-in staff can:

- View their assigned sessions
- Manage registrations for assigned sessions
- Confirm registrations
- Cancel registrations
- Check attendees in

Role restrictions are enforced on the backend.

## Events

Organizers can create and manage events with information such as:

- Event name
- Description
- Location
- Start date/time
- End date/time

Sessions are created within events.

## Sessions

Each event can contain multiple sessions.

A session contains:

- Title
- Description
- Start date/time
- End date/time
- Capacity

Organizers can create, edit, and delete sessions and change their capacity.

Check-in staff cannot create sessions or change session capacity.

## Registration Lifecycle

Registrations use the following states:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`
- `CANCELLED`
- `EXPIRED`

The lifecycle is:

    RESERVED
       |
       +----> CONFIRMED ----> CHECKED_IN
       |
       +----> CANCELLED

    RESERVED ----> EXPIRED

Only valid state transitions are allowed.

`RESERVED`, `CONFIRMED`, and `CHECKED_IN` registrations occupy session capacity.

`CANCELLED` and `EXPIRED` registrations do not occupy capacity.

Reserved registrations automatically expire after their holding period.

## Concurrency-Safe Capacity

Capacity enforcement is performed on the backend.

When a registration is created, the session is locked while the application:

1. Loads the session.
2. Checks for an existing registration.
3. Counts occupied registrations.
4. Verifies available capacity.
5. Creates the new reservation.

A pessimistic database lock is used to prevent concurrent registration requests from causing overbooking.

## Staff Assignment

Check-in staff can be assigned to sessions by organizers.

The system supports:

- Multiple staff members assigned to one session.
- One staff member assigned to multiple sessions.

Check-in staff can manage registrations only for sessions to which they are assigned.

## Registration Search

Registration management supports server-side:

- Search
- Status filtering
- Sorting
- Pagination

This avoids loading the complete registration dataset into the browser.

## CSV Import and Export

The application supports CSV import and export for session registrations.

CSV import:

- Validates individual rows.
- Imports valid rows independently.
- Reports duplicate registrations.
- Reports invalid rows and reasons.
- Does not discard valid rows because another row failed.

CSV export provides attendee registration information, including status and confirmation information.

## Registration History

Registration status changes are recorded in a separate history table.

History records contain:

- Previous status
- New status
- User who performed the action
- Notes
- Timestamp

The frontend displays the history as a timeline.

History is read-only from the application's perspective and is not exposed through update or delete operations.

## Capacity Alerts

The application detects when a session reaches its capacity.

Organizers can dismiss the capacity alert.

If capacity becomes available and the session becomes full again later, the alert can appear again.

## Dashboard

The application provides role-specific dashboard information.

### Organizer

The organizer dashboard provides information related to:

- Events
- Upcoming events
- Registration management
- Organizer functionality

### Check-in Staff

The check-in staff dashboard focuses on:

- Assigned sessions
- Upcoming sessions
- Registration management for assigned sessions

## Project Structure

The backend follows a layered structure:

    src/main/java/com/busy/event_registration/
    |
    +-- controller/
    +-- service/
    +-- repository/
    +-- entity/
    +-- dto/
    +-- security/
    +-- exception/

The frontend is organized around pages, components, and service/API modules.

## API Architecture

The application follows a REST-based architecture.

    React Frontend
          |
          | HTTP / JSON + JWT
          v
    Spring Boot REST API
          |
          | Spring Data JPA
          v
       PostgreSQL

The backend is responsible for authentication, authorization, business rules, validation, and persistence.

## Security

JWT is used for authenticated API requests.

Sensitive configuration such as database credentials and JWT secrets is provided through environment variables.

Authorization is enforced on the backend.

Frontend role-based visibility is only a usability feature and is not considered a security boundary.

## Running Locally

### Prerequisites

Install:

- Java 21
- Maven
- PostgreSQL
- Node.js and npm

### Backend

Create a PostgreSQL database and configure the required database and JWT environment variables.

Then start the Spring Boot application using Maven.

    ./mvnw spring-boot:run

On Windows, the Maven wrapper can be run with:

    mvnw.cmd spring-boot:run

### Frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

The frontend will then be available through the local development URL shown by Vite.

## Environment Variables

Sensitive configuration should be supplied through environment variables rather than committed to the repository.

Typical backend configuration includes:

    DB_URL
    DB_USERNAME
    DB_PASSWORD
    JWT_SECRET

The exact variable names should match the application's Spring configuration.

The frontend API URL should also be configured according to the frontend environment configuration.

## Deployment

The application can be deployed using separate free-tier services for:

- PostgreSQL
- Spring Boot backend
- React frontend

The deployed backend connects to the managed PostgreSQL database using environment variables.

The deployed frontend communicates with the public backend API.

## Demo Accounts

Demo credentials for the deployed application are provided in `SUBMISSION.md`.

The submission should include credentials for:

- Organizer
- Check-in Staff

## Documentation

Additional project documentation is available in the `docs/` directory.

- `docs/architecture.md` — system architecture and request flow
- `docs/schema.md` — database schema, relationships, constraints, and scaling considerations
- `docs/plan.md` — development plan and prioritisation
- `docs/decisions.md` — important technical decisions and trade-offs
- `docs/ai-prompts.md` — AI prompts used during development and how the output was verified

## Scope

The implementation focuses on the ten mandatory goals from the assignment.

Optional features such as payment processing, social login, mobile applications, real-time WebSocket updates, advanced analytics, and complex notification infrastructure were not prioritized because they were outside the mandatory scope.

## Key Design Priorities

The implementation prioritizes:

1. Server-side authorization
2. Correct registration lifecycle handling
3. Concurrency-safe capacity management
4. Immutable registration history
5. Server-side registration querying
6. Clear separation between frontend, backend, and database responsibilities
7. Completing the required scope before optional features

## Submission

The final submission consists of:

- Public GitHub repository
- Live deployed application
- `SUBMISSION.md` containing the repository URL, live URL, demo credentials, and deployment notes
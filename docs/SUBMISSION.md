# BUSY Infotech — Event Registration Platform

## Submission Details

| Item | Details |
|---|---|
| GitHub Repository | [REPLACE_WITH_GITHUB_URL] |
| Live Application | [REPLACE_WITH_LIVE_APP_URL] |
| Backend | Spring Boot |
| Frontend | React |
| Database | PostgreSQL |
| Java Version | 21 |

---

## Project Overview

This project implements an event registration platform with role-based access control for:

- Organizers
- Check-in Staff

The system supports the complete registration lifecycle, session management, staff assignment, capacity enforcement, CSV processing, registration history, capacity alerts, and role-specific dashboards.

The backend is responsible for enforcing authorization and business rules. Frontend restrictions are only used for user experience and are not treated as a security boundary.

---

## Implemented Requirements

All ten mandatory assignment goals have been implemented.

### 1. Accounts and Roles

Implemented:

- User registration and login
- JWT-based authentication
- Organizer role
- Check-in Staff role
- Organizer invitation flow
- Role-based backend authorization

Regular registration creates a Check-in Staff account.

Organizer accounts are created through the organizer invitation flow.

---

### 2. Events

Organizers can:

- Create events
- View events
- Manage event details
- Delete events as supported by the application

Events contain information such as:

- Name
- Description
- Location
- Start date/time
- End date/time

---

### 3. Sessions

Organizers can:

- Create sessions inside events
- Edit sessions
- Delete sessions
- Set session capacity

Sessions contain:

- Title
- Description
- Start date/time
- End date/time
- Capacity
- Parent event

Check-in staff cannot create sessions or modify session capacity.

---

### 4. Registration Lifecycle and Capacity

Registration lifecycle:

    RESERVED → CONFIRMED → CHECKED_IN

Other terminal states:

- `CANCELLED`
- `EXPIRED`

Rules implemented:

- Reservations temporarily hold capacity.
- Reservations expire automatically after the holding period.
- Cancelled and expired registrations release capacity.
- Checked-in registrations continue occupying capacity.
- Cancellation is not allowed after check-in.
- Overbooking is prevented on the server.
- Concurrent registration attempts are protected using database locking.

---

### 5. Staff Assignment

Organizers can assign Check-in Staff to sessions.

Rules:

- A staff member can be assigned to multiple sessions.
- A session can have multiple staff members.
- Staff can manage registrations only for sessions assigned to them.
- Staff cannot create events.
- Staff cannot create sessions.
- Staff cannot change session capacity.

These restrictions are enforced by the backend.

---

### 6. Registration Search, Filtering, Sorting and Pagination

Registration management supports server-side:

- Search
- Status filtering
- Sorting
- Pagination
- Configurable page size

Capacity information is calculated from the relevant registration states rather than relying on a manually maintained registration counter.

---

### 7. CSV Import and Export

CSV import supports:

    name,email

Import behavior:

- Valid rows create reservations.
- Duplicate attendees are reported.
- Invalid rows are reported with a reason.
- One invalid row does not prevent other valid rows from being imported.
- Capacity is enforced during import.

CSV export includes attendee registration information and status.

---

### 8. Dashboard

Role-specific dashboards are provided.

#### Organizer Dashboard

Displays information such as:

- Total events
- Upcoming events
- Organizer actions
- Event/session navigation

#### Check-in Staff Dashboard

Displays:

- Assigned sessions
- Upcoming sessions
- Next session
- Registration management links

---

### 9. Immutable Registration History

Registration status changes are recorded in a separate history table.

History records contain:

- Registration
- Previous status
- New status
- User who performed the action
- Notes
- Timestamp

The history is exposed as a read-only timeline.

History records cannot be edited or deleted through the application.

---

### 10. Capacity Alerts

When a session reaches capacity, the application displays a capacity alert.

Organizers can dismiss the alert.

If capacity becomes available and the session later becomes full again, the alert can reappear.

This allows the alert to represent the current full-capacity state rather than permanently suppressing future alerts.

---

# Demo Accounts

> Replace the following placeholders with the actual seeded accounts before submission.

## Organizer

**Email:** `[ORGANIZER_EMAIL]`

**Password:** `[ORGANIZER_PASSWORD]`

Use this account to demonstrate:

- Event management
- Session management
- Staff assignment
- Registration management
- CSV import/export
- Registration history
- Capacity alerts
- Organizer dashboard

---

## Check-in Staff

**Email:** `[STAFF_EMAIL]`

**Password:** `[STAFF_PASSWORD]`

Use this account to demonstrate:

- Assigned sessions
- Registration management
- Registration status changes
- Search/filter/sort/pagination
- Registration history

The staff account should only be able to manage sessions assigned to it.

---

# Demo Data

The application should be seeded with enough data to demonstrate the main workflows.

Recommended demo data:

- At least one organizer
- At least one check-in staff member
- Multiple events
- Multiple sessions
- Different session capacities
- Assigned staff
- Several registrations
- Registrations in different lifecycle states

This allows the evaluator to test the application without manually creating all data first.

---

# Local Setup

## Prerequisites

Install:

- Java 21
- Maven
- PostgreSQL
- Node.js and npm

---

## Backend

Navigate to the backend project:

    cd backend

Configure PostgreSQL and the required environment variables.

Then run:

    mvn spring-boot:run

The backend will start on the configured Spring Boot port.

---

## Frontend

Navigate to the frontend:

    cd frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

Open the URL shown by Vite.

---

# Environment Variables

Secrets and environment-specific configuration should not be committed to the repository.

Typical backend configuration includes:

    DB_URL
    DB_USERNAME
    DB_PASSWORD
    JWT_SECRET

Frontend configuration may include the backend API URL, depending on the deployment configuration.

Actual secret values are intentionally not included in this repository.

---

# Security Notes

Authentication uses JWT tokens.

Authorization is enforced on the backend.

The frontend may hide actions that a user is not allowed to perform, but these UI restrictions are not relied upon for security.

For example, a Check-in Staff user cannot gain organizer privileges simply by manually calling an organizer endpoint.

Session-level authorization verifies that Check-in Staff users are assigned to the session they are attempting to manage.

---

# Important Registration Rules

Capacity is occupied by:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`

Capacity is released by:

- `CANCELLED`
- `EXPIRED`

The backend locks the session while performing capacity-sensitive registration operations to prevent concurrent requests from exceeding capacity.

---

# Documentation

Additional engineering documentation is available under `docs/`.

| Document | Purpose |
|---|---|
| `docs/architecture.md` | System architecture and request flow |
| `docs/schema.md` | Database schema and relationships |
| `docs/plan.md` | Development plan and implementation order |
| `docs/decisions.md` | Important technical decisions and trade-offs |
| `docs/ai-prompts.md` | AI-assisted development prompts and corrections |

---

# Project Structure

High-level structure:

    Event-Registration/
    │
    ├── README.md
    ├── SUBMISSION.md
    ├── pom.xml
    │
    ├── docs/
    │   ├── architecture.md
    │   ├── schema.md
    │   ├── plan.md
    │   ├── decisions.md
    │   └── ai-prompts.md
    │
    ├── src/
    │   └── main/
    │       └── java/
    │           └── com/
    │               └── busy/
    │                   └── event_registration/
    │
    └── frontend/
        ├── src/
        ├── package.json
        └── ...

---

# Deployment

The application is intended to be deployed using free-tier hosting where possible.

The deployed application may experience cold starts depending on the hosting provider.

If the live application is temporarily asleep, waiting for the backend to wake up before retrying requests may be necessary.

Database credentials, JWT secrets, and other sensitive configuration values are provided through environment variables rather than committed to Git.

---

# Evaluation Flow

A quick demonstration can follow this sequence:

1. Login as Organizer.
2. View the organizer dashboard.
3. Create/view an event.
4. Open the event's sessions.
5. Create a session with a small capacity.
6. Assign Check-in Staff to the session.
7. Login as Check-in Staff.
8. Open assigned sessions.
9. Open registrations for the assigned session.
10. Create a registration.
11. Confirm the registration.
12. Check in the attendee.
13. Open registration history.
14. Test search/filter/sort/pagination.
15. Test CSV import/export.
16. Return to Organizer.
17. Fill a session to capacity.
18. Demonstrate the capacity alert.
19. Dismiss the alert.
20. Cancel/expire a registration and demonstrate capacity becoming available.

---

# Known Scope Decisions

The implementation focuses on the ten mandatory assignment goals.

Optional stretch features were intentionally not prioritised over the required functionality.

The main priority was:

1. Correct business rules
2. Server-side authorization
3. Capacity correctness under concurrency
4. Complete registration lifecycle
5. Required management features
6. Clear documentation
7. Usable frontend
8. Deployment and demonstration readiness

---

# Submission Checklist

Before submitting, verify:

- [ ] GitHub repository is publicly accessible
- [ ] Live application URL works
- [ ] Backend is deployed
- [ ] Database is connected
- [ ] Demo Organizer account works
- [ ] Demo Check-in Staff account works
- [ ] Demo data is available
- [ ] README is present in the repository root
- [ ] `SUBMISSION.md` is present in the repository root
- [ ] All five documentation files are present under `docs/`
- [ ] No passwords, JWT secrets, or database credentials are committed
- [ ] Organizer authorization works
- [ ] Staff authorization works
- [ ] Registration capacity rules work
- [ ] Registration history works
- [ ] CSV import/export works
- [ ] Capacity alerts work
- [ ] Application can be demonstrated from a fresh login

---

# Final Submission Links

**GitHub Repository**

[REPLACE_WITH_GITHUB_URL]

**Live Application**

[REPLACE_WITH_LIVE_APP_URL]
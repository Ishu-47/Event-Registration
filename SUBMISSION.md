# BUSY Infotech — Event Registration Platform

## Submission Details

| Item | Details |
|---|---|
| GitHub Repository | [https://github.com/Ishu-47/Event-Registration] |
| Live Application | [https://event-registration-jet.vercel.app/] |
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

#### Account Creation Behavior

Regular registration creates a **Check-in Staff** account.

Organizer accounts are not created through the normal registration flow. An existing Organizer creates an Organizer invitation for a specific email address.

The invitation flow works as follows:

1. Login as an Organizer.
2. Use the Organizer invitation feature to enter the email address of the new Organizer.
3. The backend generates a unique invitation token with a 24-hour expiry.
4. The application generates an invitation registration link.
5. Open the generated invitation link.
6. The registration page recognizes the invitation token and allows the invited email to create an **Organizer** account.
7. The invitation token is marked as used after successful registration and cannot be reused.

Example invitation link:

`https://event-registration-jet.vercel.app/register?invite=<invitation-token>`

The invited user must register using the email address for which the invitation was created.

This prevents a user from simply selecting the Organizer role through the normal registration form.

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

**Email:** `[organizer@test.com]`

**Password:** `[password123]`

Use this account to demonstrate:

- Event management
- Session management
- Staff assignment
- Registration management
- CSV import/export
- Registration history
- Capacity alerts
- Organizer dashboard


### Creating another Organizer

To demonstrate the Organizer invitation flow:

1. Login using the Demo Organizer account.
2. Create an Organizer invitation for a new email address.
3. Open the generated invitation link.
4. Register using that invited email address.
5. Login with the newly created Organizer account.

The invitation link is valid for 24 hours and is intended for one-time use.

---

## Check-in Staff

**Email:** `[staff@gmail.com]`

**Password:** `[password123]`

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

## Deployment

The application is deployed using free-tier hosting:

* **Frontend:** Vercel
* **Backend:** Railway Free plan
* **Database:** Neon PostgreSQL

The Railway Free plan provides limited monthly usage, so the backend may be temporarily unavailable or slower to respond after periods of inactivity. When the service is sleeping, the first request may take a little longer while the backend starts again.

The application is configured to use environment variables for database credentials, JWT secrets, and other sensitive configuration values. No credentials or secrets are committed to the repository.

### Live Application

Frontend: https://event-registration-jet.vercel.app/

Backend API: https://event-registration-production-21dc.up.railway.app/


---

# Evaluation Flow

A quick demonstration can follow this sequence:

### Account and Organizer Invitation

1. Login as the existing Demo Organizer.
2. Open the Organizer invitation feature.
3. Enter the email address for a new Organizer.
4. Generate the Organizer invitation link.
5. Copy/open the generated invitation link.
6. Complete registration using the invited email address.
7. Login using the newly created Organizer account.
8. Verify that the account has Organizer permissions.

### Organizer Workflow

9. View the Organizer dashboard.
10. Create/view an event.
11. Open the event's sessions.
12. Create a session with a small capacity.
13. Assign Check-in Staff to the session.

### Check-in Staff Workflow

14. Login as Check-in Staff.
15. Open assigned sessions.
16. Open registrations for the assigned session.
17. Create a registration.
18. Confirm the registration.
19. Check in the attendee.
20. Open registration history.
21. Test search/filter/sort/pagination.
22. Test CSV import/export.

### Capacity Workflow

23. Return to Organizer.
24. Fill a session to capacity.
25. Demonstrate the capacity alert.
26. Dismiss the alert.
27. Cancel/expire a registration and demonstrate capacity becoming available.
28. Fill the session again and demonstrate that the capacity alert reappears.

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

[https://github.com/Ishu-47/Event-Registration]

**Live Application**

[https://event-registration-jet.vercel.app/]
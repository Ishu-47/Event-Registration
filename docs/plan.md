# Development Plan

## Overview

The project was planned around the ten mandatory goals in the assignment.

The main priority was to complete the required functionality first and avoid spending significant time on optional features before the core requirements were working.

The implementation was divided into logical stages so that the backend business rules could be established before building and polishing the frontend.

## Development Order

The development was completed in the following general order:

1. Project setup and requirements review
2. Architecture and database design
3. Authentication and roles
4. Events
5. Sessions
6. Registration lifecycle and capacity
7. Staff assignment
8. Registration search, filtering, sorting, and pagination
9. CSV import and export
10. Registration history
11. Capacity alerts
12. Dashboard
13. Frontend integration and UI improvements
14. Testing and debugging
15. Documentation and submission preparation

This order allowed the backend data model and security rules to be established before building the dependent frontend functionality.

## Session 1 — Project Setup and Design

The initial work focused on understanding the assignment and identifying the required entities, roles, workflows, and relationships.

The initial design identified:

- Users
- Roles
- Events
- Sessions
- Registrations
- Staff assignments
- Registration history
- Invitations

The main registration states and capacity rules were also identified early because they affect both the database model and backend services.

The project structure and technology stack were then established.

## Session 2 — Authentication and Roles

Authentication was implemented using email/password login and JWT-based authentication.

The two required roles were introduced:

- `ORGANIZER`
- `CHECK_IN_STAFF`

Authorization was implemented on the server so role restrictions could not be bypassed by directly calling APIs.

Organizer invitation functionality was also implemented so organizer accounts could be created through the invitation workflow.

## Session 3 — Events

Event management was implemented.

The main event functionality included:

- Creating events
- Viewing events
- Managing event information
- Archiving/deleting events as supported by the application

The frontend was then connected to the event APIs.

## Session 4 — Sessions

Sessions were implemented as children of events.

The session functionality included:

- Creating sessions
- Editing sessions
- Deleting sessions
- Setting session capacity
- Viewing sessions belonging to an event

Staff assignment functionality was then connected to sessions.

Authorization was kept on the backend so check-in staff could not perform organizer-only session management operations.

## Session 5 — Registration Lifecycle and Capacity

Registration was implemented after the session model was stable.

The registration lifecycle was implemented using:

- `RESERVED`
- `CONFIRMED`
- `CHECKED_IN`
- `CANCELLED`
- `EXPIRED`

Capacity was implemented so that `RESERVED`, `CONFIRMED`, and `CHECKED_IN` registrations occupy capacity.

`CANCELLED` and `EXPIRED` registrations release capacity.

A pessimistic lock was used during capacity-sensitive registration operations to prevent concurrent requests from causing overbooking.

A scheduled process was added to automatically expire reservations after their holding period.

## Session 6 — Staff Assignment

The session/staff assignment relationship was implemented using a separate assignment table.

This supports:

- Multiple staff members assigned to one session
- One staff member assigned to multiple sessions

Backend authorization checks were added so check-in staff can manage registrations only for sessions to which they are assigned.

## Session 7 — Registration Search and Pagination

Registration listing was expanded to support server-side:

- Search
- Status filtering
- Sorting
- Pagination

The goal was to avoid loading all registrations into the browser and performing the complete query operation on the client.

## Session 8 — CSV Import and Export

CSV functionality was added for registration management.

The import process validates rows independently so that valid rows can still be imported when other rows are invalid or duplicated.

CSV export was implemented for session registration data.

CSV parsing was kept on the backend so validation and business rules remain server-side.

## Session 9 — Registration History

Registration history was added to provide an audit trail of status changes.

History records store:

- Previous status
- New status
- User performing the action
- Notes
- Timestamp

The frontend was then updated to display the registration history as a timeline.

History records are treated as read-only application data.

## Session 10 — Capacity Alerts and Dashboard

Capacity alerts were implemented for full sessions.

The organizer can dismiss the alert, and the alert can appear again after capacity becomes available and the session reaches capacity again.

Dashboard functionality was added for both roles.

The organizer dashboard focuses on event and registration management, while the check-in staff dashboard focuses on assigned sessions and registration management.

## Frontend Integration and UI

After the major backend functionality was available, the React frontend was connected to the APIs and the main workflows were made accessible through the UI.

The frontend includes:

- Authentication screens
- Dashboard
- Events
- Sessions
- Registration management
- Staff assignment
- CSV operations
- Registration history
- Capacity alerts

Role-specific controls were added to make the interface clearer for organizers and check-in staff.

However, frontend role checks were not treated as the security boundary. Backend authorization remains responsible for enforcing permissions.

## Debugging and Verification

Testing and debugging were performed incrementally while implementing each feature.

Some issues required changes after initial implementation.

Examples included:

- Fixing authorization behavior
- Adjusting session and registration relationships
- Correcting capacity calculations
- Handling concurrent capacity-sensitive registration operations
- Fixing CSV formatting and parsing behavior
- Updating deprecated Apache Commons CSV API usage
- Correcting frontend routing and authentication issues
- Verifying staff assignment behavior
- Verifying registration history
- Fixing role-specific frontend behavior

The application was repeatedly tested through the actual frontend and API rather than assuming that code generation alone meant the feature was complete.

## Estimated Versus Actual Time

The assignment suggested approximately 12 hours of work.

The original expectation was to divide the work into approximately two-hour sessions over several days.

In practice, the time distribution changed depending on debugging complexity.

More time was spent on:

- Registration capacity and concurrency
- Authentication and authorization
- Staff assignment
- CSV import/export
- Frontend/backend integration
- Debugging role-specific behavior

Less time was spent on:

- Basic CRUD functionality
- Initial project setup
- Simple frontend screens

The development order therefore changed slightly as implementation issues were discovered.

## What Was Cut

The ten mandatory goals were treated as the cutoff.

Optional product features were deliberately not prioritized until the required functionality was complete.

Features not implemented because they were outside the core scope include:

- Payment processing
- Email/SMS infrastructure
- Social login
- Mobile applications
- Real-time WebSocket functionality
- Advanced analytics
- Complex event discovery
- Multi-tenant organization management

The decision was to finish the mandatory functionality properly rather than partially implementing additional features.

## Final Verification Order

Before submission, the application should be checked in the following order:

1. Authentication works for both roles.
2. Organizer permissions work.
3. Check-in staff permissions work.
4. Staff can access only assigned sessions.
5. Session capacity cannot be exceeded.
6. Registration lifecycle transitions work correctly.
7. Reservation expiration works.
8. Search/filter/sort/pagination work.
9. CSV import/export work.
10. Registration history is recorded.
11. Capacity alerts work and can reappear.
12. Dashboard data is correct.
13. Sensitive configuration is stored in environment variables.
14. Required documentation is committed.
15. The application is deployed with usable demo credentials.

## Prioritisation Principle

The overall development strategy was:

**Complete the required functionality first, verify the important business rules, then improve the interface and documentation.**

This kept the implementation focused on the ten mandatory goals and reduced the risk of spending the limited time budget on features that were not required.
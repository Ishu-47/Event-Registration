# AI Prompts

## Overview

AI tools were used throughout the project to speed up development, debugging, code review, and documentation.

AI was treated as a development assistant rather than as the final authority. Generated code was reviewed, integrated, tested, and modified when it did not match the application's requirements.

The prompts below are grouped roughly in the order in which they were used during development.

## 1. Project Planning and Architecture

### Prompt

I am building an event registration platform for a take-home assignment.

The system needs:

- Organizer and check-in staff roles
- Events and sessions
- Session capacity
- Registration lifecycle
- Staff assignment
- Search, filtering, sorting and pagination
- CSV import/export
- Dashboard
- Immutable registration history
- Capacity alerts

I am using Spring Boot, PostgreSQL, React and Tailwind CSS.

Help me design the architecture and implementation order so I can complete the mandatory requirements efficiently without overengineering.

### How the output was used

The output was used to establish the initial development order and identify the main backend entities, services, relationships, and frontend areas.

The implementation was then adjusted as the actual application requirements became clearer.

## 2. Authentication and Roles

### Prompt

I have an event registration system with two roles: ORGANIZER and CHECK_IN_STAFF.

Organizers can manage events, sessions, registrations and staff assignments.

Check-in staff can manage registrations only for sessions they are assigned to.

Help me design the Spring Security and JWT authorization structure so these restrictions are enforced on the backend rather than only in React.

### How the output was used

The generated approach was used as a starting point for JWT authentication, role-based authorization, and session assignment checks.

The final implementation was adapted to the application's existing authentication structure.

## 3. Registration Capacity

### Prompt

I need to implement registration capacity correctly.

A session has a fixed capacity.

RESERVED, CONFIRMED and CHECKED_IN registrations occupy capacity.

CANCELLED and EXPIRED registrations do not.

The system must prevent overbooking even if multiple registration requests arrive concurrently.

I am using Spring Boot, JPA and PostgreSQL. What is a simple reliable implementation?

### How the output was used

This led to the use of a pessimistic lock on the session during capacity-sensitive registration operations.

The final implementation performs the capacity calculation and registration creation while the session is locked.

## 4. Registration Lifecycle

### Prompt

Implement a registration lifecycle with these states:

RESERVED
CONFIRMED
CHECKED_IN
CANCELLED
EXPIRED

The valid transitions are:

RESERVED -> CONFIRMED
CONFIRMED -> CHECKED_IN
RESERVED -> CANCELLED
CONFIRMED -> CANCELLED
RESERVED -> EXPIRED

Cancellation should not be possible after check-in.

Reservations should automatically expire after a holding period.

Help me implement this cleanly in a Spring Boot service.

### How the output was used

The service methods were implemented around explicit state checks.

The generated approach was reviewed and adjusted to match the application's existing entities, repositories, exceptions, and authorization rules.

## 5. Staff Assignment

### Prompt

A check-in staff member can be assigned to multiple sessions and a session can have multiple check-in staff members.

I need to implement this relationship in Spring Boot and PostgreSQL and ensure that staff can manage registrations only for sessions assigned to them.

Suggest the entity and repository structure and the authorization check.

### How the output was used

A separate `session_staff_assignments` table was implemented.

The backend checks the assignment before allowing check-in staff to manage a session's registrations.

## 6. Server-Side Search and Pagination

### Prompt

I need registration search, status filtering, sorting and pagination to happen on the server.

The frontend should not load all registrations and filter them locally.

I am using Spring Data JPA.

Show me a simple implementation using pageable queries and optional search/status parameters.

### How the output was used

The registration repository and service were extended to support server-side querying.

The frontend sends the requested search, filter, sort and pagination values to the API.

## 7. CSV Import and Export

### Prompt

I need CSV import/export for session registrations.

The CSV import should contain name and email.

Each row should be processed independently:

- valid rows should be imported
- duplicate emails for the same session should be reported
- invalid rows should be reported with a reason
- valid rows should still be imported if other rows fail

The export should include registered attendees and their status.

I am using Spring Boot and Apache Commons CSV.

### How the output was used

Apache Commons CSV was added and used for parsing and generating CSV files.

The import logic was implemented so errors in individual rows do not stop valid rows from being processed.

## 8. Debugging CSV Parsing

### Problem

During testing, a CSV file created through a spreadsheet application was interpreted as using tab-separated values instead of commas.

The backend reported an error similar to:

`expected [name,email]`

### Prompt

My Spring Boot CSV import is expecting columns `name,email`, but a CSV file created from my spreadsheet application is being parsed incorrectly.

Help me determine whether the problem is the CSV delimiter/format and how to create a correctly formatted CSV for testing.

### What I changed

I inspected the actual file contents instead of assuming the file extension guaranteed comma-separated values.

A comma-separated CSV was then used for testing.

This was a useful reminder to verify the actual input format rather than only relying on the filename extension.

## 9. Deprecated Commons CSV API

### Problem

Apache Commons CSV reported that:

`CSVFormat.Builder.build()`

was deprecated.

### Prompt

I am using Apache Commons CSV 1.14.1 and getting a deprecation warning for `CSVFormat.Builder.build()`.

The API documentation says to use `get()` instead.

Show me the minimal change required for the existing parser code.

### What I changed

The deprecated `.build()` call was replaced with `.get()`.

No larger refactoring was needed.

## 10. Registration History

### Prompt

The assignment requires an immutable registration history.

Every registration status transition should record:

- registration
- old status
- new status
- who performed the action
- notes
- timestamp

The history should be viewable as a timeline but should not be editable or deletable.

Help me implement this in Spring Boot with a separate entity and repository.

### How the output was used

A separate `RegistrationHistory` entity and repository were created.

History records are created when registration states change and are returned to the frontend for the timeline.

The history API is read-only.

## 11. Debugging Registration History

### Problem

The initial implementation successfully recorded manual status transitions, but automatic expiration required separate consideration because the scheduled process does not have a normal authenticated user.

### Prompt

My registration history requirement says every status transition must be recorded.

Manual transitions have an authenticated user, but reservations can also automatically expire through a scheduled Spring service.

How should I handle the history entry for a system-generated expiration while keeping the history immutable?

### What I changed

The scheduled expiration path was treated separately from user-triggered operations.

The important requirement was that the automatic state transition must still be represented in the history rather than silently changing the registration state.

## 12. Frontend Role Handling

### Prompt

I have organizer and check-in staff roles.

The React frontend should show appropriate controls for each role, but the backend must remain the security boundary.

Help me make the UI role-aware without duplicating the authorization rules unnecessarily.

### How the output was used

Role-aware UI behavior was added so organizers receive management controls while staff receive the appropriate registration/session functionality.

Backend authorization was kept independent from these frontend checks.

## 13. Wrong Output — Session Permissions

### Prompt

Check-in staff should be able to access their assigned sessions, while organizers can manage sessions.

Help me update the SessionController and SessionService so the role restrictions are correctly implemented.

### What went wrong

An early interpretation incorrectly treated staff as being allowed to create or delete sessions.

This did not match the assignment requirement.

The assignment explicitly states that check-in staff cannot create sessions or change session capacity.

### Correction

The requirement was reviewed again and the authorization model was corrected.

The final rule is:

- Organizers can create, edit, delete and manage session capacity.
- Check-in staff cannot create sessions.
- Check-in staff cannot change session capacity.
- Check-in staff manage registrations only for sessions assigned to them.

This was an important example of why generated code must be checked against the original requirements instead of being accepted automatically.

## 14. Frontend Routing Debugging

### Problem

The React application produced an error indicating that `useRoutes()` was being used outside of a Router context.

### Prompt

My React application is showing:

`useRoutes() may be used only in the context of a <Router> component.`

The error occurs around the Routes component.

Help me identify the cause and the correct React Router structure.

### How the output was used

The routing structure was reviewed and the application was placed inside `BrowserRouter` at the appropriate entry point.

## 15. Session Frontend Debugging

### Prompt

My sessions are not visible to check-in staff even though the backend authentication and staff assignment are working.

I want staff to see their assigned sessions while hiding organizer-only session management controls.

Help me inspect the React session page and identify whether the problem is the API request, role handling, routing, or rendering.

### How the output was used

The frontend session flow was reviewed against the backend endpoints.

The goal was to ensure that staff use the assigned-session endpoint rather than expecting the organizer event/session management endpoint to behave the same way.

## 16. Documentation

### Prompt

I need to prepare the required documentation for an event registration take-home assignment.

The assignment requires:

- architecture.md
- schema.md
- plan.md
- decisions.md
- ai-prompts.md
- SUBMISSION.md

The documentation should explain actual technical decisions, trade-offs, development order, AI usage, and limitations rather than sounding like generic generated documentation.

Help me structure the documents around the implementation.

### How the output was used

The documentation was organized around the assignment's explicit questions and the actual implementation choices made during development.

## How AI Output Was Verified

AI-generated code was not treated as automatically correct.

The general verification process was:

1. Compare the generated solution with the assignment requirements.
2. Check the existing entity, repository, service, and controller structure.
3. Make the minimum necessary changes rather than replacing unrelated code.
4. Run the application.
5. Test the affected API or frontend workflow.
6. Inspect errors and logs.
7. Adjust the implementation when behavior did not match expectations.

Several iterations were required for authorization, CSV handling, frontend routing, session visibility, registration capacity, and history.

## Lessons From Using AI

The main lesson was that AI is most useful when it is given the existing code and a precise requirement.

Broad prompts can produce technically valid code that does not match the application's existing architecture or the exact assignment requirement.

The most important verification steps were:

- checking generated code against the original requirements
- testing API authorization directly
- testing concurrent capacity behavior
- testing CSV files with real input
- checking frontend behavior against actual backend endpoints
- reviewing generated code before committing it

AI reduced implementation and debugging time, but the final implementation decisions remained based on the application's requirements and observed behavior.
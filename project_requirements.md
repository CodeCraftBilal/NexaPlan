# AI Powered Project Management Tool — Project Memory

## 1. Project Overview

Build a modern **AI Powered Project Management Tool** that helps teams create, plan, manage, track, and complete software or general projects.

The system should combine normal project-management features with AI assistance.

The main goal is:

> **Make project planning and management easier by using AI to organize tasks, identify problems, summarize progress, and help teams complete projects.**

The application should be simple, clean, responsive, and easy to understand.

---

# 2. Main Problem

Traditional project-management tools require users to manually create projects, break projects into tasks, track progress, and understand project status.

This system should reduce that manual work by allowing AI to assist with:

* Project planning
* Task creation
* Task prioritization
* Task assignment
* Progress summaries
* Risk/problem detection
* Project status analysis
* Suggestions for next actions

AI should **assist the user**, not completely control the project.

The user must always be able to review and modify AI-generated information.

---

# 3. Target Users

The system supports these roles:

1. **Admin**
2. **Workspace Owner**
3. **Project Manager**
4. **Team Member**
5. **Viewer**

---

# 4. User Roles

## Admin

System-level administrator.

Responsibilities:

* Manage users
* Manage workspaces
* View system information
* Manage platform settings
* Handle administrative operations

---

## Workspace Owner

Owns a workspace.

Responsibilities:

* Create and manage workspace
* Invite members
* Remove members
* Manage workspace settings
* Create projects
* Manage workspace-level permissions

---

## Project Manager

Manages individual projects.

Responsibilities:

* Create projects
* Edit projects
* Create and manage tasks
* Assign tasks
* Set priorities
* Set deadlines
* Manage project members
* Track project progress
* Use AI project-management features

---

## Team Member

Works on assigned tasks.

Responsibilities:

* View projects they have access to
* View assigned tasks
* Update task status
* Add comments
* Add task updates
* View project information

Team members should not be able to perform manager-only actions.

---

## Viewer

Read-only user.

Can:

* View projects
* View tasks
* View project progress
* View comments and updates

Cannot:

* Create tasks
* Edit tasks
* Delete tasks
* Change project settings
* Manage members

---

# 5. RBAC / Permissions

Implement role-based access control.

Basic permission model:

| Action           | Admin | Owner | Manager | Member   | Viewer |
| ---------------- | ----- | ----- | ------- | -------- | ------ |
| Manage users     | ✓     | -     | -       | -        | -      |
| Manage workspace | ✓     | ✓     | -       | -        | -      |
| Create project   | ✓     | ✓     | ✓       | -        | -      |
| Edit project     | ✓     | ✓     | ✓       | -        | -      |
| Delete project   | ✓     | ✓     | ✓       | -        | -      |
| Create task      | ✓     | ✓     | ✓       | Optional | -      |
| Assign task      | ✓     | ✓     | ✓       | -        | -      |
| Update own task  | ✓     | ✓     | ✓       | ✓        | -      |
| View project     | ✓     | ✓     | ✓       | ✓        | ✓      |
| Add comments     | ✓     | ✓     | ✓       | ✓        | -      |
| Use AI features  | ✓     | ✓     | ✓       | Limited  | -      |

Permissions should be enforced on the backend, not only hidden in the frontend.

---

# 6. Core Concepts

The system should use the following hierarchy:

```text
User
  ↓
Workspace
  ↓
Project
  ↓
Task
  ↓
Subtask
```

Supporting entities:

```text
Workspace
├── Members
├── Projects
│   ├── Tasks
│   │   ├── Subtasks
│   │   ├── Comments
│   │   └── Activity
│   ├── Project Members
│   └── AI Insights
└── Settings
```

---

# 7. Workspace

A workspace represents an organization, team, company, university group, or personal working environment.

Workspace should contain:

* Name
* Description
* Owner
* Members
* Projects
* Created date
* Updated date
* Settings

Users should be able to belong to appropriate workspaces according to the permission model.

---

# 8. Project

A project represents a specific piece of work.

Project fields:

* Project name
* Description
* Status
* Priority
* Start date
* Due date
* Owner / Project Manager
* Members
* Tasks
* Progress
* Created date
* Updated date

Project statuses:

```text
PLANNING
ACTIVE
ON_HOLD
COMPLETED
ARCHIVED
```

Project priorities:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# 9. Tasks

Tasks are the main units of work.

Each task should support:

* Title
* Description
* Status
* Priority
* Assignee
* Creator
* Due date
* Start date
* Estimated time
* Tags
* Project
* Parent task/subtask
* Comments
* Activity history
* Created date
* Updated date

Task statuses:

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
BLOCKED
CANCELLED
```

Task priorities:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# 10. Subtasks

Tasks may contain smaller subtasks.

Example:

```text
Task:
Create Authentication

Subtasks:
- Create database user model
- Create signup API
- Create login API
- Add password hashing
- Add frontend login screen
- Test authentication
```

Completing subtasks should contribute to the parent task's progress.

---

# 11. Task Views

The application should support simple task-management views.

### List View

Display:

* Task
* Assignee
* Priority
* Status
* Due date

### Kanban View

Columns:

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
```

Tasks should be movable between columns.

### Project Overview

Show:

* Total tasks
* Completed tasks
* Pending tasks
* Overdue tasks
* Blocked tasks
* Overall progress

---

# 12. Comments and Activity

Users should be able to communicate around tasks.

Comments should support:

* Author
* Content
* Created time
* Updated time

Maintain an activity history for important actions such as:

* Task created
* Task assigned
* Status changed
* Priority changed
* Due date changed
* Task completed
* Comment added

Example:

```text
Bilal changed task status from TODO → IN_PROGRESS.
```

---

# 13. Notifications

Implement basic notifications.

Examples:

* Task assigned to user
* Task deadline approaching
* Task overdue
* Mention in comment
* Project update
* Invitation to workspace

Notifications should have:

* Title
* Message
* Type
* Read/unread status
* Created time

---

# 14. AI Features

AI is a major part of this project.

However, AI should be implemented as an **assistant layer around the normal project-management system**.

Do not make the entire application dependent on AI.

---

## AI Feature 1 — Project Planning

User can provide a project idea.

Example:

```text
I want to build an online food delivery application.
```

AI should generate a suggested project plan:

```text
1. Project Setup
2. Authentication
3. Restaurant Management
4. Food Management
5. Cart
6. Orders
7. Delivery
8. Payments
9. Notifications
10. Testing
```

Each phase can contain suggested tasks.

The user must be able to:

* Review
* Edit
* Remove
* Accept
* Reject

AI-generated tasks should not automatically become permanent without user confirmation.

---

# 15. AI Feature 2 — Task Generation

AI should generate tasks from a project description or requirement.

Example:

```text
Requirement:
Users should be able to register using email and password.
```

AI may generate:

```text
- Create user database model
- Create registration API
- Add email validation
- Add password hashing
- Create registration UI
- Add validation errors
- Test registration
```

---

# 16. AI Feature 3 — Task Prioritization

AI can analyze tasks and suggest priorities based on:

* Deadline
* Dependencies
* Project importance
* Task status
* Estimated effort
* Blocking relationships

Example:

```text
Suggested priority: HIGH

Reason:
This task blocks three other tasks and is due in 2 days.
```

The user must be able to accept or reject the suggestion.

---

# 17. AI Feature 4 — Project Summary

AI should analyze project data and generate a short summary.

Example:

```text
Project Progress: 68%

12 of 18 tasks are completed.

Main concern:
3 high-priority tasks are overdue.

Recommendation:
Focus on the authentication and deployment tasks first.
```

The summary should be concise and understandable.

---

# 18. AI Feature 5 — Risk Detection

AI should identify potential project problems.

Examples:

* Too many overdue tasks
* Important task is blocked
* Deadline approaching
* Too much work assigned to one person
* Project progress is behind schedule
* Tasks have unrealistic deadlines

Example:

```text
Risk:
The project has 5 overdue high-priority tasks.

Suggested action:
Review task assignments and deadlines.
```

---

# 19. AI Feature 6 — Next Action Suggestions

AI should suggest what the team should work on next.

Example:

```text
Recommended next task:

Implement Login API

Reason:
- High priority
- No dependencies
- Blocks frontend authentication
- Due soon
```

---

# 20. AI Chat Assistant

Provide an AI assistant inside the project.

The assistant should understand project context.

Example questions:

```text
What should we work on next?
Which tasks are overdue?
Summarize this project.
What are the biggest risks?
Who has the most assigned work?
Create tasks for authentication.
Why is the project behind schedule?
```

AI responses should be based on actual project data.

Do not allow AI to invent project information.

---

# 21. AI Actions

AI may suggest actions, but destructive or important operations should require confirmation.

For example:

```text
AI:
I recommend creating 7 tasks.

[Review Tasks] [Cancel]
```

For destructive actions:

```text
AI:
I found 4 duplicate tasks.

Would you like to archive them?

[Confirm] [Cancel]
```

Never allow AI to silently delete important project data.

---

# 22. Dashboard

Create a clean dashboard.

Dashboard should show:

* Total projects
* Active projects
* Completed projects
* My tasks
* Overdue tasks
* Tasks due soon
* Project progress
* Recent activity
* AI insights

Keep the dashboard simple.

Do not overload it with unnecessary charts.

---

# 23. Project Dashboard

Each project should have an overview page containing:

```text
Project Header
    ↓
Project Progress
    ↓
Statistics
    ↓
Task Overview
    ↓
Recent Activity
    ↓
AI Insights
```

Useful statistics:

* Total tasks
* Completed
* In progress
* Overdue
* Blocked

---

# 24. Main Application Pages

The application should have at least:

```text
Authentication
├── Login
├── Register
└── Forgot Password

Main Application
├── Dashboard
├── Workspaces
├── Projects
│   ├── Project Overview
│   ├── Tasks
│   ├── Kanban
│   ├── Activity
│   └── AI Assistant
├── My Tasks
├── Notifications
├── Profile
└── Settings
```

Admin users should have appropriate admin pages.

---

# 25. Authentication

Implement secure authentication.

Required functionality:

* Registration
* Login
* Logout
* Password hashing
* Password reset
* Session/token management
* Protected routes
* Role-based authorization

Never store passwords as plain text.

Authentication logic must be handled securely on the backend.

---

# 26. Database

Use a relational database.

Suggested main tables/entities:

```text
User
Workspace
WorkspaceMember
Project
ProjectMember
Task
SubTask
Comment
Activity
Notification
AIInsight
Invitation
```

Relationships should be properly defined.

Example:

```text
User 1 ─── * WorkspaceMember
Workspace 1 ─── * WorkspaceMember

Workspace 1 ─── * Project

Project 1 ─── * ProjectMember
Project 1 ─── * Task

Task 1 ─── * SubTask
Task 1 ─── * Comment
Task 1 ─── * Activity

User 1 ─── * Notification
```

Use foreign keys and appropriate indexes.

---

# 27. API Design

Use a clean REST API unless the existing project architecture requires another approach.

Example:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /users/me

GET    /workspaces
POST   /workspaces
GET    /workspaces/:id
PATCH  /workspaces/:id
DELETE /workspaces/:id

GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/tasks
POST   /projects/:id/tasks

GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id

POST   /tasks/:id/comments
GET    /tasks/:id/comments

GET    /notifications
PATCH  /notifications/:id/read
```

AI endpoints:

```text
POST /ai/project-plan
POST /ai/generate-tasks
POST /ai/prioritize-tasks
POST /ai/project-summary
POST /ai/risk-analysis
POST /ai/next-actions
POST /ai/chat
```

AI endpoints should receive only the project information necessary for the requested operation.

---

# 28. Backend Rules

Backend must:

* Validate all input
* Authenticate users
* Authorize users
* Validate workspace membership
* Validate project membership
* Enforce RBAC
* Handle errors consistently
* Protect sensitive information
* Prevent unauthorized data access

Never trust frontend permissions.

For example, hiding a Delete button is not enough.

The backend must reject unauthorized DELETE requests.

---

# 29. Frontend Rules

Frontend should:

* Be responsive
* Have clear navigation
* Use reusable components
* Show loading states
* Show error states
* Show empty states
* Provide confirmation for destructive actions
* Avoid unnecessary complexity
* Keep UI consistent

Use reusable components for:

```text
Button
Input
Modal
Dropdown
Badge
TaskCard
TaskList
ProjectCard
StatusBadge
PriorityBadge
Loading
EmptyState
ErrorState
```

---

# 30. UI/UX Design

Design should be:

* Modern
* Clean
* Minimal
* Professional
* Easy to understand

Avoid:

* Excessive animations
* Overly complicated layouts
* Too many colors
* Unnecessary screens
* Excessive information density

Important actions should be obvious.

Use consistent:

* Spacing
* Typography
* Buttons
* Colors
* Status indicators
* Cards
* Forms

---

# 31. Search and Filtering

Projects and tasks should support basic search/filtering.

Task filters:

```text
Status
Priority
Assignee
Due date
```

Search should allow users to quickly find tasks/projects.

---

# 32. Project Progress

Project progress should be calculated from task completion.

Example:

```text
Total tasks = 10
Completed tasks = 7

Progress = 70%
```

Do not allow inconsistent manually entered progress unless there is a clear reason.

---

# 33. Overdue Tasks

A task is overdue when:

```text
Current date > Due date
AND
Task status != COMPLETED
```

Overdue tasks should be clearly identified.

AI can use overdue information for risk analysis.

---

# 34. Task Dependencies

For the MVP, support a simple dependency model if it does not significantly complicate development.

Example:

```text
Task A
  ↓
Task B
  ↓
Task C
```

Task B should not be considered ready if Task A is incomplete.

If dependency implementation becomes too complex, keep it as a post-MVP feature.

---

# 35. MVP Scope

The first working version must focus on core functionality.

### MVP must include:

```text
Authentication
    ↓
Workspace
    ↓
Projects
    ↓
Tasks
    ↓
Task assignment
    ↓
Task status
    ↓
Task priority
    ↓
Due dates
    ↓
Comments
    ↓
Dashboard
    ↓
RBAC
    ↓
Basic AI assistance
```

AI MVP features:

1. Generate project plan
2. Generate tasks
3. Project summary
4. Risk detection
5. Next-action suggestions

Do not spend excessive time on advanced AI features before the core project-management system works.

---

# 36. Post-MVP Features

Possible future features:

* Calendar
* Gantt chart
* Advanced task dependencies
* Time tracking
* File attachments
* Real-time collaboration
* Advanced analytics
* Email notifications
* Slack integration
* GitHub integration
* Jira integration
* AI-generated reports
* AI meeting summaries
* AI workload balancing
* AI deadline prediction
* Custom workflows
* Custom roles
* Mobile application

These should NOT block the MVP.

---

# 37. Security Requirements

Security is important.

Implement:

* Password hashing
* Authentication
* Authorization
* Input validation
* API validation
* Secure sessions/tokens
* Rate limiting where appropriate
* Protection against unauthorized access
* Proper CORS configuration
* Environment variables for secrets
* No API keys in frontend source code
* No sensitive information in logs

AI API keys must never be exposed to the client.

---

# 38. AI Safety and Reliability

AI output is not always correct.

Therefore:

* AI suggestions must be reviewable.
* AI must not silently modify important data.
* AI must not fabricate project information.
* AI should clearly indicate when information is unavailable.
* Destructive AI actions require confirmation.
* AI-generated tasks should be editable before saving.

AI should behave as:

```text
Assistant → Suggest → User reviews → User confirms → System executes
```

not:

```text
AI → Automatically changes everything
```

---

# 39. Error Handling

Every important operation must handle:

```text
Loading
Success
Error
Empty
Unauthorized
Not Found
```

Use consistent API error responses.

Example:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action."
}
```

Do not expose internal server errors to users.

---

# 40. Code Architecture

Use a modular architecture.

Separate:

```text
Authentication
Users
Workspaces
Projects
Tasks
Comments
Notifications
AI
```

Frontend should separate:

```text
Pages/Screens
Components
Services/API
State
Types
Utilities
Hooks
```

Backend should separate:

```text
Controllers
Services
Repositories/Data Access
Models
DTOs/Schemas
Middleware
Guards/Auth
AI Services
```

Avoid putting all application logic into one large file.

---

# 41. Reusability

Prefer reusable components and services.

Do not duplicate logic.

For example, use one reusable:

```text
TaskForm
```

instead of creating separate task forms for every screen.

Similarly, use shared:

```text
API client
Authentication logic
Validation
Error handling
UI components
```

---

# 42. Development Strategy

Build the project incrementally.

Recommended order:

### Phase 1 — Foundation

* Project setup
* Folder structure
* Database
* Environment configuration
* Basic UI
* Authentication

### Phase 2 — Workspace

* Workspace creation
* Workspace members
* Invitations
* RBAC

### Phase 3 — Projects

* Project CRUD
* Project members
* Project dashboard

### Phase 4 — Tasks

* Task CRUD
* Assignment
* Status
* Priority
* Due dates
* Subtasks
* Comments
* Activity

### Phase 5 — Dashboard

* Statistics
* Progress
* My tasks
* Overdue tasks
* Recent activity

### Phase 6 — AI

* Project planning
* Task generation
* Summary
* Risk analysis
* Next actions
* AI chat

### Phase 7 — Polish

* Loading states
* Error handling
* Empty states
* Responsive UI
* Security
* Testing
* Performance optimization

---

# 43. Important AI Agent Instructions

You are an AI coding agent working on this project.

Treat this file as the **source of truth for project requirements**.

Before making major changes:

1. Inspect the existing project.
2. Understand the current architecture.
3. Do not unnecessarily rewrite working code.
4. Reuse existing components and services.
5. Check existing dependencies before adding new ones.
6. Keep implementation simple.
7. Follow the existing coding style.
8. Do not introduce unnecessary libraries.
9. Do not implement post-MVP features unless explicitly requested.
10. Do not remove working functionality without a reason.

---

# 44. Before Coding

For a major feature:

1. Analyze the requirement.
2. Inspect related existing files.
3. Identify dependencies.
4. Explain the implementation plan.
5. Identify files that need modification.
6. Implement the feature.
7. Run type checking/linting/tests where available.
8. Fix errors.
9. Verify that existing functionality still works.

For small, obvious fixes, implementation can proceed directly.

---

# 45. Database Rules

When modifying database models:

* Keep relationships consistent.
* Add appropriate indexes.
* Avoid duplicate data where unnecessary.
* Use proper constraints.
* Handle migrations safely.
* Never destroy existing user/project data during development migrations unless explicitly requested.

---

# 46. API Rules

Every API should:

1. Validate input.
2. Authenticate the user when required.
3. Check permissions.
4. Perform the operation.
5. Return a consistent response.
6. Handle errors safely.

Example successful response:

```json
{
  "success": true,
  "data": {}
}
```

Example error:

```json
{
  "success": false,
  "message": "Task not found."
}
```

---

# 47. Testing

At minimum test:

### Authentication

* Register
* Login
* Logout
* Invalid credentials

### RBAC

* Admin permissions
* Owner permissions
* Manager permissions
* Member permissions
* Viewer restrictions

### Projects

* Create
* Read
* Update
* Delete
* Unauthorized access

### Tasks

* Create
* Assign
* Update status
* Update priority
* Complete
* Delete
* Comments

### AI

* Project plan generation
* Task generation
* Summary
* Risk detection
* Next-action suggestions

---

# 48. Performance

Keep the application efficient.

Avoid:

* Unnecessary API requests
* Repeated database queries
* Loading all tasks when pagination is possible
* Huge frontend components
* Unnecessary AI requests

AI requests can be expensive, so only call AI when needed.

Cache or reuse generated information when appropriate.

---

# 49. Data Privacy

Project information may contain private company/team information.

Therefore:

* Do not expose another workspace's data.
* Always scope database queries to the current user's authorized workspace/project.
* Do not send unnecessary data to AI providers.
* Never expose passwords or authentication secrets to AI.

---

# 50. Important MVP Principle

Do not try to build a huge Jira/Asana replacement immediately.

The goal of the MVP is:

> **A simple project-management system with useful AI assistance.**

A small, stable, working feature is better than a large unfinished feature.

---

# 51. Definition of Done

A feature is complete only when:

* UI is implemented
* Backend/API is implemented where required
* Database changes are implemented where required
* Authentication/authorization is handled
* Validation is implemented
* Loading state exists
* Error state exists
* Empty state exists where appropriate
* Existing functionality still works
* Type errors are fixed
* Basic testing/verification is completed

---

# 52. Final Product Flow

The expected high-level user flow is:

```text
User
 ↓
Register / Login
 ↓
Create or Join Workspace
 ↓
Create Project
 ↓
Describe Project
 ↓
AI Suggests Project Plan
 ↓
User Reviews / Edits Plan
 ↓
Tasks Created
 ↓
Assign Tasks
 ↓
Team Works on Tasks
 ↓
Update Status / Comments
 ↓
Dashboard Tracks Progress
 ↓
AI Analyzes Project
 ↓
AI Detects Risks
 ↓
AI Suggests Next Actions
 ↓
Project Completed
```

---

# 53. Core Product Principle

The application should always follow this principle:

> **Normal project management + AI assistance + human control.**

AI should make project management faster and smarter while the user remains in control of the final decisions.

# AI Project Manager API

Express backend for **ProjectAI**, an AI-assisted project management application. It owns authentication, workspace/project access, persistence, task operations, and optional OpenAI/Gemini calls. The actual directory is `api/`; the companion frontend is [web/](../web/README.md).

## Start here in a new session

Read the [product overview](../README.md), [AGENTS.md](../AGENTS.md), this README, and the [web README](../web/README.md). [project_requirements.md](../project_requirements.md) describes the target product, including substantial unimplemented scope. Source and tests determine current behavior; schema models are not proof that an API exists.

There are two independent npm packages with separate lockfiles and no root npm runner. The normal request path is browser -> Next.js `/api` rewrite -> Express -> PostgreSQL. AI provider configuration is optional. Socket.IO shares Express's HTTP server but is not yet consumed by the web app.

## Stack and module layout

Express 5, TypeScript with strict NodeNext/ESM configuration, Prisma 5 with PostgreSQL, Zod 4, bcryptjs, JWT, Socket.IO 4, and `@google/genai`. See [package.json](package.json) and `package-lock.json` for exact dependency resolution. Local relative imports use `.js` extensions even in `.ts` source; preserve this for compiled ESM.

| Path                                                                                                   | Responsibility                                                                                  |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [src/index.ts](src/index.ts)                                                                           | Create HTTP server, attach Socket.IO, listen on the configured port.                            |
| [src/app.ts](src/app.ts)                                                                               | `createApp()`, middleware, limiters, route mounts, health checks, 404/error handling.           |
| [src/config/env.ts](src/config/env.ts)                                                                 | Load dotenv and validate environment at module import; invalid configuration exits the process. |
| [src/config/database.ts](src/config/database.ts)                                                       | Shared Prisma client, reused through a global in development.                                   |
| [src/config/session.ts](src/config/session.ts)                                                         | Shared cookie options and seven-day session lifetime.                                           |
| [src/config/socket.ts](src/config/socket.ts)                                                           | Socket authentication and authorized project/workspace room joins.                              |
| [src/routes/](src/routes/)                                                                             | Auth, workspace, project, task, and AI HTTP handlers.                                           |
| [src/services/access.service.ts](src/services/access.service.ts)                                       | Shared workspace/project authorization and contributor permission flags.                        |
| [src/services/](src/services/)                                                                         | Workspace, project, task persistence and AI provider operations.                                |
| [src/middleware/auth.ts](src/middleware/auth.ts)                                                       | Session verification and authenticated request types.                                           |
| [src/middleware/errorHandler.ts](src/middleware/errorHandler.ts)                                       | Zod, malformed JSON, expected HTTP, and unexpected error responses.                             |
| [src/utils/validation.ts](src/utils/validation.ts)                                                     | Shared request schemas.                                                                         |
| [src/utils/apiResponse.ts](src/utils/apiResponse.ts), [src/utils/httpError.ts](src/utils/httpError.ts) | Domain response envelope and expected HTTP error class.                                         |
| [prisma/schema.prisma](prisma/schema.prisma), [prisma/migrations/](prisma/migrations/)                 | Data model and checked-in SQL migration history.                                                |
| [tests/](tests/)                                                                                       | HTTP/auth, access-control, contributor, and production-cookie regressions.                      |

Keep route parsing/response handling, business rules, access checks, and persistence modular. Auth currently uses an injectable `AuthRepository` inside `createAuthRouter()`; `createApp({ authRepository })` lets tests avoid real user persistence.

## Local setup

Install Node.js/npm compatible with both packages (Next.js in `web/` requires Node >=20.9.0) and run PostgreSQL. No Node version, PostgreSQL version, container setup, or deployment provider is pinned in the repository.

From the repository root:

```powershell
cd api
npm ci
Copy-Item .env.example .env
```

Copy the example only on first setup; preserve any existing `.env`. Edit the local values, ensure the target database is available, then run from `api/`:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run dev
```

`migrate deploy` applies existing checked-in migrations. For an intentional schema change on a development database, use `npx prisma migrate dev --name <descriptive_name>`, review and commit the generated migration, and regenerate the client. Do not use `db push` as a replacement for versioned migrations or reset a populated database to resolve drift.

Start `web/` separately. Visit `http://localhost:5000/health` for a process health response, or `http://localhost:5000/api` for the API root. These routes do not query PostgreSQL or AI providers and are not dependency-readiness checks. There is no seed script or default account; register through the frontend.

### Environment

[.env.example](.env.example) contains placeholders only. Keep real credentials in ignored environment files or deployment secrets.

| Variable         | Required/default         | Purpose                                                                                                   |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | Required URL             | PostgreSQL connection string, including database/schema.                                                  |
| `JWT_SECRET`     | Required nonempty string | JWT signing secret; use a strong private value. Changing it invalidates existing sessions.                |
| `CLIENT_URL`     | Required URL             | Exact frontend origin allowed by HTTP and Socket.IO CORS; locally `http://localhost:3000`.                |
| `PORT`           | `5000`                   | HTTP and Socket.IO listening port.                                                                        |
| `NODE_ENV`       | `development`            | `development`, `production`, or `test`; production enables secure cookies.                                |
| `GEMINI_API_KEY` | Optional                 | Enables Gemini calls. Missing, empty, or example placeholder values result in a `503` from AI operations. |

Set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini` in `api/.env` and restart the API to switch providers. If omitted, a non-placeholder `OPENAI_API_KEY` selects OpenAI; otherwise Gemini is selected. There is no automatic fallback after provider errors.

| Variable         | Required/default   | Purpose                                                                           |
| ---------------- | ------------------ | --------------------------------------------------------------------------------- |
| `OPENAI_API_KEY` | Optional           | Enables OpenAI calls; missing, blank, or example keys return `503` when selected. |
| `AI_PROVIDER`    | Optional           | `openai` or `gemini`; explicit selection overrides key-based selection.           |
| `OPENAI_MODEL`   | `gpt-4.1-mini`     | OpenAI model ID; configurable according to account access.                        |
| `GEMINI_MODEL`   | `gemini-2.5-flash` | Gemini model ID.                                                                  |

Provider calls have a 60-second timeout. Failed, malformed, or empty provider responses return a sanitized `502`; raw provider errors are not logged. OpenAI requests set `store: false`. Missing credentials affect AI operations only. Model defaults describe source configuration, not guaranteed provider availability.

`npm run dev` uses `nodemon.json` to watch `src/`, run `tsx src/index.ts`, and set development mode. Normal project management and authentication do not require an AI provider key.

## Current HTTP contract

All domain routes are prefixed with `/api`. Auth register/login/logout and health/root routes are public; `/auth/me` and every workspace/project/task/AI route require authentication.

| Method | Path                                   | Input / behavior                                                                                                       |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`, `/health`, `/api`                 | Process/API status; no dependency checks.                                                                              |
| POST   | `/api/auth/register`                   | `{ name, email, password }`; create user/session; `201`.                                                               |
| POST   | `/api/auth/login`                      | `{ email, password }`; establish session.                                                                              |
| POST   | `/api/auth/logout`                     | Clear the session cookie.                                                                                              |
| GET    | `/api/auth/me`                         | Look up current account and return public user fields.                                                                 |
| GET    | `/api/workspaces`                      | Workspaces where the user is a member, with member/project counts.                                                     |
| POST   | `/api/workspaces`                      | `{ name, description? }`; create workspace and owner membership.                                                       |
| GET    | `/api/workspaces/:id`                  | Workspace details, members, and project summaries; requires workspace membership.                                      |
| POST   | `/api/projects`                        | `{ name, description?, workspaceId }`; create project and creator's project-manager membership.                        |
| GET    | `/api/projects/workspace/:workspaceId` | List workspace projects; non-managers see only their project memberships.                                              |
| GET    | `/api/projects/:id`                    | Project with contributors, workspace name, and contributor-management permission flags.                                |
| POST   | `/api/projects/:id/contributors`       | `{ email, role? }`; add an existing registered user; role defaults to `MEMBER`, accepts `MEMBER`, `VIEWER`, `MANAGER`. |
| POST   | `/api/tasks`                           | `{ title, projectId, description?, assigneeId?, priority?, status? }`; create task.                                    |
| GET    | `/api/tasks/mine`                      | Assigned tasks or own unassigned tasks, scoped to accessible projects; due-date/creation ordering.                     |
| GET    | `/api/tasks/project/:projectId`        | Authorized project tasks with assignee display fields, newest first.                                                   |
| PATCH  | `/api/tasks/:id/status`                | `{ status }`; change task status after project write authorization.                                                    |
| POST   | `/api/ai/project-plan`                 | `{ description }`; return Markdown in `data.plan`.                                                                     |
| POST   | `/api/ai/risk-analysis`                | `{ projectContext }`; return text in `data.analysis`.                                                                  |

There is no global `GET /api/projects`, general task/project update/delete route, or comments/notifications/invitations API. Unknown routes and unsupported method/path combinations fall through to JSON `404`.

`POST /api/ai/chat` accepts `{ projectId, message, history? }` and returns authorized project chat and reviewable task proposals (details below).

### Responses and validation

Domain success responses normally use `{ success: true, message, data }`. Register/login/me instead use `{ success: true, user: { id, name, email, role, avatar } }`; they do not return password hashes or a token property. Logout returns `{ success: true, message }`.

Expected failures use `{ success: false, message }`. Zod failures add `errors` containing Zod 4 issues and return `400`; malformed JSON also returns `400`. `HttpError` preserves its status; unexpected errors are logged server-side and return a generic `500`.

Schemas trim text and normalize auth/contributor email to lowercase. Registration requires a 2-100 character name, valid email, and password of at least 6 characters and at most 72 UTF-8 bytes. Workspace/project/task schemas bound text and restrict enum values. AI input validation remains limited: project planning checks description presence, and risk analysis accepts arbitrary client context.

## Authentication and access rules

- Passwords are bcrypt-hashed with cost 10. Email lookups are case-insensitive, with duplicate-registration conflicts mapped to `409`.
- JWTs contain user `id` and system `role`, expire after seven days, and are verified with HS256. Accepted system roles are `USER` and `ADMIN`.
- HTTP authentication prefers the `token` cookie, then a Bearer authorization header. Browser login uses the cookie; there is no token-issuing bearer endpoint.
- Cookies are HttpOnly, `SameSite=Lax`, `Path=/`, and `Secure` in production. Login and logout share the same options. `/auth/me` clears the cookie and returns `401` if the account no longer exists.
- Auth responses set `Cache-Control: no-store`. There is no refresh-token/session revocation store; logout clears the browser cookie. System `ADMIN` does not currently bypass membership checks.

Current service rules are more permissive than the target requirements' manager-only matrix in some areas. Preserve or intentionally revise them with tests; do not assume the roadmap is already enforced.

| Operation                        | Current authorization                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace access                 | Requires a `WorkspaceMember` record. Write checks reject `VIEWER`.                                                                                                  |
| Project creation                 | Any non-viewer workspace member can create; the creator becomes project `MANAGER`.                                                                                  |
| Project read                     | Requires workspace membership plus project membership, unless workspace role is `OWNER` or `MANAGER`.                                                               |
| Task creation/status update      | Project write access; workspace managers/owners or non-viewer project members whose workspace role is not `VIEWER`. Status changes are not limited to the assignee. |
| Task assignee                    | The proposed assignee must have project read access; currently this can include viewers.                                                                            |
| Add contributors                 | Workspace owner/manager, or project manager whose workspace role is not `VIEWER`.                                                                                   |
| Add missing workspace membership | Only workspace owner/manager; creates a `MEMBER` membership alongside the contributor in one transaction.                                                           |

Contributor additions reject unknown accounts (`404`), duplicates (`409`), and assigning a non-viewer project role to an existing workspace viewer (`400`). Project managers can add existing workspace members but cannot expand workspace membership. Project detail responses expose `permissions.canManageContributors` and `permissions.canAddWorkspaceMembers` for the UI.

One current visibility difference: workspace detail returns all project summaries after checking workspace membership, while the dedicated project list filters non-managers by project membership. This is an implementation limitation to consider when changing access behavior.

## Database model and implemented scope

[schema.prisma](prisma/schema.prisma) defines UUID IDs, membership uniqueness constraints, relations, and cascading behavior. Check actual relations before introducing deletion. The initial SQL migration is under `prisma/migrations/20260915163905_npx_prisma_db_push/`; despite its name it is a checked-in SQL migration.

| Model                                                            | Current use                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `User`                                                           | Registration, login, ownership, memberships, task creators/assignees.                                         |
| `Workspace`, `WorkspaceMember`                                   | Workspace creation/list/detail and access control.                                                            |
| `Project`, `ProjectMember`                                       | Project creation/list/detail, contributors, access control.                                                   |
| `Task`                                                           | Create/list/status APIs. Self-referencing `parentId` models subtasks, but no subtask API exists.              |
| `Comment`, `Activity`, `Notification`, `Invitation`, `AIInsight` | Schema exists; current services do not expose full workflows or populate these as part of task/AI operations. |

Workspace roles: `OWNER`, `MANAGER`, `MEMBER`, `VIEWER`. Project roles: `MANAGER`, `MEMBER`, `VIEWER`. Project statuses: `PLANNING` (default), `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`. Task statuses: `TODO` (default), `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`, `CANCELLED`. Both project and task priorities: `LOW`, `MEDIUM` (default), `HIGH`, `URGENT`.

Project start/due dates and status/priority editing, task dates/tags/estimates/parent/order editing, and general deletes are not exposed by current routes. Task status changes do not create activity records or notifications. Frontend progress is computed from tasks rather than stored as editable project progress.

## AI and realtime boundaries

[AIService](src/services/ai.service.ts) owns shared prompts and delegates text generation through the `AIProvider` interface to [OpenAIService](src/services/openai.service.ts) or [GeminiService](src/services/gemini.service.ts). OpenAI uses native fetch with the [Responses API](https://developers.openai.com/api/docs/guides/text); Gemini uses `@google/genai`. Both initialize on demand. Plan generation requests phases/tasks as Markdown; risk analysis serializes submitted context into the prompt. Neither operation persists an insight or creates tasks.

The legacy plan and risk endpoints require a session and accept submitted context; the frontend instead uses `POST /api/ai/chat`. [ProjectAssistantService](src/services/project-assistant.service.ts) enforces workspace/project read access before loading context or calling the provider. It selects project name, description, status, priority, due date, task count, and up to 100 recent tasks (title, bounded description, status, priority, due date, and assignee name). It excludes emails and credentials. The prompt includes the snapshot date and explicitly marks truncated task lists.

Chat accepts `{ projectId, message, history? }`: message is 1?4,000 trimmed characters; history is at most 10 user/assistant messages of 1?4,000 characters. Unknown request fields are rejected. The response envelope contains `{ reply, suggestedTasks, canCreateTasks, context: { taskCount, includedTasks, asOf } }`. Provider JSON is validated: up to 8 task proposals with title, description and a valid priority; malformed output returns `502`. Prompt guidance distinguishes project facts from proposals and treats context/history as untrusted data.

Chat never writes data. The frontend reviews proposals using the existing task creation route, which rechecks project write access. Viewers may chat but cannot save proposals. Conversation history and proposal state are not persisted. Existing task edits/deletions, automatic assignment and bulk acceptance are not implemented.

Socket.IO authenticates via cookie or `handshake.auth.token`. It accepts:

| Client event                       | Server action                                       |
| ---------------------------------- | --------------------------------------------------- |
| `join_workspace` with workspace ID | Authorize membership, then join `workspace_<id>`.   |
| `join_project` with project ID     | Authorize project access, then join `project_<id>`. |

Failed room access emits `access_error` with a message. Successful task writes emit `task:created` or `task:updated` to the project room with the Prisma mutation result, which does not include the assignee expansion used by task list reads. There are no workspace broadcasts or web subscriptions yet. The Next `/api` rewrite does not cover `/socket.io`; adding a client requires an explicit transport/proxy design.

## Commands, tests, and operational notes

Run from `api/`:

| Command                                   | Purpose                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                             | Nodemon + tsx development server.                                  |
| `npm run build`                           | Compile `src/` to `dist/` with TypeScript.                         |
| `npm start`                               | Run `dist/index.js`; build first.                                  |
| `npx tsc --noEmit` / `npm run type-check` | Check source types; `tests/` is outside the compiler include list. |
| `npm test`                                | Run `tests/*.test.ts` through Node's test runner and tsx.          |
| `npm run format`                          | Format the package with Prettier.                                  |
| `npm run format:check`                    | Check formatting without edits.                                    |
| `npx prisma generate`                     | Regenerate the client after schema/dependency changes.             |
| `npx prisma migrate deploy`               | Apply committed migrations to the configured database.             |

After code changes, run `npm run format`, `npx tsc --noEmit`, and relevant tests. There is no API lint script. Tests inject an in-memory auth repository, mock Prisma delegates, and use an ephemeral local HTTP server. They supply isolated environment values and do not require a live database or AI provider key. Coverage includes cookies, registration conflicts, validation, task access, and contributors; this is not a real-database, Socket.IO, or live-AI integration suite.

The app uses Helmet, credentialed CORS for `CLIENT_URL`, and a 1 MB JSON limit. `/api` has a 1000-request/15-minute limiter; login/register additionally have a 30-request/15-minute limiter with successful requests skipped. Production deployment requires HTTPS for cookies, generated Prisma client, applied migrations, built output, and required environment. There is no checked-in deployment automation, and proxy trust is not configured in Express.

If startup exits, check required environment values. If Prisma types are missing/stale, regenerate the client. For query failures, check database availability and migration state; a successful `/health` alone does not establish database connectivity. An AI `503` with working normal routes is expected when the selected AI provider is not configured.

## Keeping this context current

Update this README in the same task as every major API change: endpoints and payloads, authorization, data model/migrations, AI/socket behavior, environment/setup, commands, and remaining limitations. Update the web README for integration or user-flow changes, and the root README when features, user workflows, or setup change. Replace stale claims and distinguish shipped behavior, mocks, and roadmap work. [AGENTS.md](../AGENTS.md) defines this as part of completion for AI agents.

# ProjectAI web

The Next.js frontend for **AI Project Manager**, branded **ProjectAI** in the UI. The product combines workspace/project/task management with optional AI assistance. Users remain in control of project changes.

## Start here in a new session

Read the [product overview](../README.md), [AGENTS.md](../AGENTS.md), this README, and the [API README](../api/README.md) before changing behavior across packages. [project_requirements.md](../project_requirements.md) describes the intended product and roadmap; it includes features that are not implemented. Verify current behavior in source and tests.

The repository contains two independent npm packages, `web/` and `api/`, each with its own lockfile. There is no root package or workspace command runner. The backend directory is named `api/`.

## Architecture and stack

```text
Browser -> Next.js :3000 -> /api/* rewrite -> Express :5000 -> PostgreSQL
                                                 |
                                                 +-> Gemini (optional)
```

- Next.js 16.2.9 App Router, React 19.2.4, strict TypeScript, Tailwind CSS 4.
- Axios handles HTTP; Zustand holds in-memory authentication state.
- `@hello-pangea/dnd` supports the task board; Lucide provides icons; `react-markdown` renders the mock assistant's messages.
- The browser uses relative `/api` URLs. [next.config.ts](next.config.ts) forwards them to the API server. There are no Next.js API route handlers or frontend database connections.
- API types in [lib/types.ts](lib/types.ts) are maintained manually. There is no shared generated contract package.

Versions describe the checked-in manifests, not an upgrade recommendation. See [package.json](package.json) and `package-lock.json` for the full dependency set.

## Local setup

Use Node.js and npm; the installed Next.js package requires Node >=20.9.0. The repository does not pin a Node version. Start PostgreSQL and configure/start `api/` using its README first.

From the repository root:

```powershell
cd web
npm ci
npm run dev
```

Open `http://localhost:3000`. For a fresh database, register an account, create a workspace, create a project, and add tasks. Additional contributors must register before they can be added by email. There is no seed script or bundled demo account.

The frontend works without an environment file for the default local API. To use another API origin, create an ignored `web/.env.local`:

```dotenv
API_URL=http://localhost:5000
```

| Variable  | Meaning                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `API_URL` | Server-side API origin used by Next rewrites; defaults to `http://localhost:5000`. Omit the `/api` suffix. |

Restart the dev server after changing configuration; set `API_URL` before a production build. Do not put `DATABASE_URL`, `JWT_SECRET`, or `GEMINI_API_KEY` in frontend configuration. The browser has no `NEXT_PUBLIC_API_URL` dependency.

## Routes and implementation status

Route groups `(auth)` and `(dashboard)` organize layouts without appearing in URLs.

| Route                                | Current behavior                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `/`                                  | Public landing page; marketing content is not a record of implemented features.                       |
| `/login`, `/register`                | Shared authentication form, validation, session restoration, safe return navigation.                  |
| `/dashboard`                         | Fetches accessible projects and `/tasks/mine`; task statistics reflect that personal task set.        |
| `/workspaces`                        | List and create workspaces.                                                                           |
| `/workspaces/[workspaceId]`          | Workspace details, members, and projects.                                                             |
| `/projects`                          | Aggregates projects across the user's workspaces; client-side filtering.                              |
| `/projects/new`                      | Create a project in an existing workspace.                                                            |
| `/projects/[projectId]`              | Project overview and task-derived progress; task creation/status controls.                            |
| `/projects/[projectId]/tasks`        | Task list with search, priority filtering, creation, and status changes.                              |
| `/projects/[projectId]/board`        | Six status columns, drag between columns, status selectors, task creation.                            |
| `/projects/[projectId]/contributors` | List contributors and add registered users by email with API-provided permission flags.               |
| `/projects/[projectId]/ai`           | **Mock UI**: hard-coded project context and delayed canned responses; no API request.                 |
| `/my-tasks`                          | Assigned tasks plus tasks created by the user that remain unassigned, limited to accessible projects. |

`/tasks`, `/settings`, and `/notifications` appear in route protection rules but have no corresponding pages. Password reset, profile, admin, comments, activity, invitation acceptance, and notification flows are not implemented. Schema fields and installed libraries do not imply a working feature.

## Source map and reuse points

| Path                                                                                                         | Responsibility                                                                                            |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [app/layout.tsx](app/layout.tsx), [providers/Providers.tsx](providers/Providers.tsx)                         | Root metadata, styles, and initial session check.                                                         |
| `app/(auth)/auth-form.tsx`                                                                                   | Shared login/register form and authentication navigation.                                                 |
| `app/(dashboard)/layout.tsx`                                                                                 | Protected shell, navigation, reconnect state, logout.                                                     |
| [proxy.ts](proxy.ts), [lib/auth-navigation.ts](lib/auth-navigation.ts)                                       | Cookie-presence route gate, protected path matching, safe return URLs.                                    |
| [lib/auth-session.ts](lib/auth-session.ts), [stores/authStore.ts](stores/authStore.ts)                       | Session hydration and race-safe state transitions.                                                        |
| [lib/api.ts](lib/api.ts)                                                                                     | Shared credentialed Axios client, 15-second timeout, session-expiration interceptor, auth error messages. |
| [lib/project-data.ts](lib/project-data.ts)                                                                   | Workspace/project fetching, labels, project request error messages.                                       |
| [lib/types.ts](lib/types.ts)                                                                                 | API envelope and workspace/project/member/task types.                                                     |
| [components/project-ui.tsx](components/project-ui.tsx)                                                       | `useProject`, shared headers/cards/badges, task composer/rows, loading/error/empty states.                |
| [components/project-tasks.tsx](components/project-tasks.tsx)                                                 | Shared implementation for task list and board.                                                            |
| [components/ui/](components/ui/)                                                                             | Reusable button, input, label, and card primitives.                                                       |
| [components/brand.tsx](components/brand.tsx), [components/landing-footer.tsx](components/landing-footer.tsx) | Shared branding and public footer.                                                                        |
| [app/globals.css](app/globals.css)                                                                           | Tailwind theme, dark palette, shared CSS classes, animation and reduced-motion rules.                     |
| [tests/auth.test.mjs](tests/auth.test.mjs)                                                                   | Session, interceptor, navigation, and proxy regressions.                                                  |

Use `@/` imports for paths relative to `web/`. Interactive pages/components declare `"use client"`; preserve server/client boundaries. Reuse the existing dark charcoal/lime theme, `panel`, `field`, `btn-primary`, and related utilities. Fonts currently use a CSS fallback stack; there is no `next/font` setup. [lucide-react.d.ts](lucide-react.d.ts) contains an ambient module declaration, so type checking alone does not establish icon export correctness.

Homepage and dashboard typography uses shared Tailwind theme tokens in `app/globals.css`: `text-ui-body` (15px), `text-ui-label` (14px), `text-ui-meta` (13px), and `text-ui-caption` (12px), expressed in rem at the default root size. Reuse these roles for readable body text, navigation, and supporting details; preserve the larger heading hierarchy and responsive wrapping. The shared buttons, badges, eyebrows, and secondary links use the same scale.

## Authentication contract

1. Register/login calls return `{ success: true, user }` and set an HttpOnly `token` cookie. Credentials/tokens are not stored in localStorage or returned as a login token field.
2. The root provider calls `initializeAuth()`, which shares one pending `/auth/me` request across repeated initialization. Zustand starts in a loading state and is not persisted across reloads.
3. A monotonically increasing session `revision` prevents a late request from restoring an old session or logging out a newly signed-in user. Preserve this guard in both hydration and Axios interceptors.
4. The Next proxy checks only whether a cookie exists. The API validates it, and `/auth/me` establishes the client session. An existing cookie must not force navigation away from login/register.
5. `401`/`404` during hydration settle as signed out; outages and malformed payloads produce a retryable session error. A protected request's `401` clears only the matching current session; auth requests are excluded from that interceptor behavior.
6. `safeReturnTo()` permits only protected internal paths. Logout clears client state after `/auth/logout` succeeds.

Authentication responses differ from domain responses: workspace/project/task endpoints use `{ success, message, data }`, while auth puts `user` at the top level. See the API README for routes and authorization rules. UI visibility is not an authorization boundary.

## Task and data behavior

- `fetchProjects()` fetches workspaces, then requests projects once per workspace and flattens the results. There is no global `GET /projects` endpoint, query cache, or pagination.
- `useProject()` loads project details and tasks together, ignores results after cleanup, and exposes local state and retry behavior.
- Task creation accepts title, description, project, initial status, priority, and optional assignee. Due dates and other schema fields have no write controls/API support yet.
- Status values are `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`, `CANCELLED`; priorities are `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- Board status changes are optimistic and restore the previous status on failure. Dragging within a column does not persist ordering.
- The API emits Socket.IO task events, but this frontend does not connect or subscribe. `socket.io-client` is installed only; there is no live multi-user refresh.
- The assistant page is a prototype. The backend's real plan and risk endpoints are not connected to it, and generated plans do not create tasks.

## Commands and verification

Run from `web/`:

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Start Next development server on port 3000 by default. |
| `npm run build`        | Build the production application.                      |
| `npm start`            | Serve the existing production build.                   |
| `npm run lint`         | Run the configured Next/ESLint rules.                  |
| `npm test`             | Run Node-based auth regression tests.                  |
| `npm run format`       | Format the package with Prettier.                      |
| `npm run format:check` | Check formatting without edits.                        |
| `npx tsc --noEmit`     | Check TypeScript.                                      |

After code changes, run `npm run format` and `npx tsc --noEmit`; run relevant tests and lint, plus a build when routing/configuration or production behavior changes. Auth tests transpile real modules into isolated contexts and mock Axios; they do not require PostgreSQL or a running API. They are not browser end-to-end tests. Check affected UI flows manually when changing pages.

## Troubleshooting and remaining work

- A reconnect screen or failed `/api/auth/me` request often means the API is stopped or `API_URL` is wrong. Check `http://localhost:5000/health` and the API environment first.
- A `403` can be correct: workspace membership, project membership, and roles are checked independently. Do not bypass these checks to make a screen load.
- Task controls are not comprehensively hidden for viewers; the API rejects unauthorized writes.
- Production uses secure cookies and requires HTTPS. Preserve same-origin `/api` forwarding; the existing rewrite does not proxy Socket.IO's `/socket.io` transport.
- Planned requirements include richer task editing, due dates, comments, activity, notifications, invitations, AI review/acceptance, and administration. Consult the requirements and current API before implementing them.

## Keeping this context current

For every major frontend change, update this README in the same task: routes, features and mock status, data flows, auth behavior, shared modules, environment/setup, validation commands, and limitations as applicable. Update the API README too when the contract or integration changes, and the root README when features, user workflows, or setup change. Replace stale descriptions; keep this a current project map rather than a session log. [AGENTS.md](../AGENTS.md) makes this part of completion for AI agents.

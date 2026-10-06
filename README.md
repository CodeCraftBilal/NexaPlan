# ProjectAI — AI Project Manager

**Organize your team's work with workspaces, projects, and tasks, with a foundation for AI-assisted planning.**

ProjectAI brings project overviews, a task list, a drag-and-drop board, and contributor management into one web application. Core project management works independently of AI configuration.

The project is under active development. The main management flows are connected to the backend; the in-app AI assistant uses OpenAI or Gemini to answer project questions and suggest tasks for review. It reads current project data through an authorized backend endpoint.

## What you can do today

| Feature                 | What it offers                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account access          | Register, sign in, restore your session, and sign out with secure cookie-based authentication.                                                                  |
| Workspaces              | Create workspaces, browse your memberships, and view members and projects.                                                                                      |
| Projects                | Create projects within a workspace, browse accessible projects, and view project progress based on task completion.                                             |
| Task management         | Create tasks with descriptions, priorities, initial statuses, and optional assignees. Search tasks and filter by priority in project task views.                |
| Task board              | Move tasks across To do, In progress, In review, Completed, Blocked, and Cancelled columns. Failed status updates restore the previous state.                   |
| My tasks                | See tasks assigned to you and tasks you created that remain unassigned, within projects you can access.                                                         |
| Personal dashboard      | View accessible project counts, personal task completion, open work, and overdue tasks when due dates exist.                                                    |
| Contributors and roles  | Add registered users to projects by email with manager, member, or viewer roles, subject to backend permission checks.                                          |
| Responsive interface    | Use the main application with mobile navigation, a dark theme, and loading, error, and empty states.                                                            |
| AI backend capabilities | Generate a project plan from a description or request risk analysis of submitted context through authenticated API endpoints when an AI provider is configured. |

Task assignment is available when creating a task. General task editing, reassignment, and setting due dates are not yet exposed through the current API/UI. The dashboard can display dates already present in the database.

## A typical workflow

1. Register an account and create a workspace for your team or personal work.
2. Create a project inside the workspace.
3. Have teammates register, then add them as project contributors using their email addresses.
4. Add tasks, choose priorities, and optionally assign contributors.
5. Update statuses through the task list or board, and follow progress in the project overview and your dashboard.
6. Open a project?s AI assistant to organize work, ask questions, and review suggested tasks before creating them.

Access is scoped by workspace and project membership. Workspace owners/managers can manage contributors across their workspace; project managers have a narrower scope. See the [API permission reference](api/README.md#authentication-and-access-rules) for the exact current rules.

## AI and development status

AI is intended to assist users with planning and analysis while users retain control over changes.

- **Available in the API:** project-plan generation and risk analysis using OpenAI or Gemini, enabled by an optional API key. These return text and do not create tasks or save insights.
- **Available in the website:** the project AI assistant answers questions about progress, priorities, workload and risks using current project details and up to 100 recent tasks. Suggested tasks can be edited, dismissed or created individually after review. Conversations are kept only while the page is open.
- **Backend foundation:** Socket.IO supports authenticated rooms and task events. The website does not yet subscribe, so changes from another user do not appear through live updates.
- **Planned:** AI edits to existing tasks, richer task editing and due dates, subtasks, comments, activity history, notifications, invitation acceptance, password reset, and administration.

The [product requirements](project_requirements.md) describe the broader intended product. They include planned features; the package READMEs document what is implemented.

## Technology

| Layer               | Stack                                                       |
| ------------------- | ----------------------------------------------------------- |
| Web                 | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| Client data and UI  | Axios, Zustand, Lucide, `@hello-pangea/dnd`                 |
| API                 | Express 5, TypeScript, Zod, JWT, bcryptjs                   |
| Database            | PostgreSQL with Prisma 7 and the node-postgres adapter      |
| AI                  | OpenAI Responses API and Google Gemini via `@google/genai`  |
| Realtime foundation | Socket.IO                                                   |
| Quality checks      | TypeScript, Prettier, web ESLint, Node's test runner        |

```text
Browser
  -> Next.js web app (localhost:3000)
     -> /api rewrite to Express (localhost:5000)
        -> PostgreSQL
        -> OpenAI / Gemini (optional)
```

The browser sends API requests to the same origin as the website. Next.js forwards them to Express; database credentials and AI keys stay on the backend.

## Run locally

### Prerequisites

- Node.js 22.12+ on the 22.x line (or another version accepted by `api/package.json`: `^20.19 || ^22.12 || >=24.0`) and npm. These backend requirements also satisfy Next.js. No exact Node patch version is pinned.
- A running PostgreSQL instance and a database connection you can use locally.
- An OpenAI or Gemini API key only if you want to call the AI endpoints.

There is no root `package.json`: install dependencies and run commands separately in `api/` and `web/`.

### 1. Configure and start the API

From the repository root:

```powershell
cd api
npm ci
```

On first setup, copy `api/.env.example` to `api/.env` and edit the values. Preserve an existing environment file. Set `DATABASE_URL` for your PostgreSQL database, a private `JWT_SECRET`, and `CLIENT_URL=http://localhost:3000`. Leave `PORT=5000` and `NODE_ENV=development` for the default local setup. AI provider configuration is optional.

For AI, set `OPENAI_API_KEY` or `GEMINI_API_KEY`. Optionally set `AI_PROVIDER=openai` or `AI_PROVIDER=gemini`; without it, a configured OpenAI key takes precedence. Models are configurable via `OPENAI_MODEL` and `GEMINI_MODEL`. Restart the API after changes.

Then, from `api/`:

```powershell
npm run db:generate
npx prisma migrate deploy
npm run dev
```

The migration command applies the checked-in migrations to your configured database. `http://localhost:5000/health` checks that the server is running; it does not verify the database connection.

### 2. Start the website

Open a second terminal at the repository root:

```powershell
cd web
npm ci
npm run dev
```

Open **http://localhost:3000**, register, and create your first workspace. There is no seeded demo account.

The web app forwards requests to `http://localhost:5000` by default. For another API origin, set `API_URL` in an ignored `web/.env.local` file without an `/api` suffix, then restart the web server. Keep API secrets out of frontend environment variables.

## Repository guide

```text
.
├── README.md                 Product overview and quick start
├── AGENTS.md                 Repository conventions for AI agents
├── project_requirements.md   Product direction and planned scope
├── web/
│   ├── README.md             Frontend architecture and implementation context
│   ├── app/                  Pages and layouts
│   ├── components/           Shared UI and task views
│   ├── lib/                  API client, session helpers, types, data helpers
│   ├── stores/               Authentication state
│   └── tests/                Frontend auth/navigation regressions
└── api/
    ├── README.md             API contracts, permissions, setup, and limitations
    ├── src/                  Routes, services, middleware, configuration
    ├── prisma/               Database schema and migrations
    └── tests/                API and permission regressions
```

## Development and verification

Run these from each package directory after code changes:

```powershell
npm run format
npx tsc --noEmit
npm test
```

The web package also provides `npm run lint`. Both packages provide `npm run build` and `npm start` for building and serving production output. Production needs configured environment variables, database migrations, and HTTPS for secure cookies; deployment automation is not included.

Run `npm run db:generate` in `api/` before type checks or tests after a fresh install. The API build also regenerates its Prisma client before compiling. Prisma CLI configuration lives in `api/prisma.config.ts`; generation needs `DATABASE_URL` to be set but does not connect to PostgreSQL.

The default tests use mocked persistence/HTTP dependencies and do not require PostgreSQL or AI provider keys. The API also provides `npm run test:integration` for a dedicated local PostgreSQL test database; see the [API verification instructions](api/README.md#commands-tests-and-operational-notes). These checks are not a complete browser or live-AI suite.

Before making changes, read [AGENTS.md](AGENTS.md), the [web development guide](web/README.md), and the [API development guide](api/README.md). Keep code modular, reuse existing components/services, and enforce permissions on the backend. Include documentation updates with major changes: this README explains the product to users and developers; package READMEs provide detailed context for implementation and future AI sessions.

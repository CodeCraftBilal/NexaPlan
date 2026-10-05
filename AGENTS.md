# Agent instructions

These instructions apply to the entire repository. Follow any additional instructions in a more specific `AGENTS.md` when working in its directory.

# frontend
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Build context before editing

- Read [README.md](README.md) for the user-facing product overview, then [web/README.md](web/README.md) and [api/README.md](api/README.md) for architecture, setup, contracts, current features, and limitations.
- Read relevant sections of [project_requirements.md](project_requirements.md) for product intent. It is a roadmap, not evidence that every feature exists. Verify behavior against source and tests.
- Inspect `git status` and the relevant diff before editing. Preserve user changes and unrelated work; do not reset or overwrite them.
- `web/` and `api/` are separate npm packages with their own lockfiles. Run commands from the relevant package; there is no root `package.json`.
- Inspect the affected route, caller, validation, service, access check, model, and existing tests before changing a cross-package contract.

## Implementation practices

- Use a modular approach to avoid code redundancy. Reuse existing components, hooks, services, schemas, and helpers before adding new abstractions. Keep changes focused on the requested outcome.
- Keep TypeScript strict. Avoid introducing `any`, unchecked casts, blanket lint suppressions, or disabled compiler checks to hide problems. Validate external input at boundaries.
- In the API, keep HTTP handling in routes, business/persistence logic in services, authorization in shared access helpers, and request schemas in `src/utils/validation.ts`. Preserve `.js` extensions for relative ESM imports.
- In the web app, reuse `lib/api.ts`, shared project helpers/components, and theme utilities. Preserve server/client boundaries, accessible form labels, keyboard controls, and loading/error/empty/retry states.
- Keep API payloads, frontend types, callers, and tests consistent when changing a contract. Do not assume auth responses use the domain response envelope.
- Preserve session revision guards, safe return navigation, and shared cookie settings. Cookie presence in the Next proxy is not proof of authentication; backend checks remain authoritative.
- Enforce workspace/project authorization on the server for every affected operation. Never rely on hidden UI controls, client-submitted ownership, or a system role to grant access unless the backend explicitly supports it.
- Keep secrets out of code, logs, documentation, and public frontend environment variables. Document variable names and safe placeholders; preserve existing local environment files.
- For schema changes, update Prisma schema, create/review a versioned migration, regenerate the client, and update affected contracts. Do not rewrite applied migrations or reset/delete database data without explicit authorization.
- Keep normal project management usable without AI. Use authorized project context and require user review before applying AI-generated changes; do not present mock responses as live project analysis.
- Use the existing npm toolchain and lockfiles. Avoid unrelated dependency upgrades and generated-file edits (`node_modules`, `.next`, `dist`, Prisma client output, TypeScript build caches).

## Required verification

- After completing code changes, run `npm run format` in each affected package.
- After code changes, run `npx tsc --noEmit` in each affected package. Run both when shared behavior or contracts change.
- Run relevant existing tests with `npm test`. Add focused regression coverage for meaningful behavior changes, especially authentication, authorization, validation, and persistence; documentation-only changes do not require new tests.
- For web code changes, run `npm run lint`. Run `npm run build` when routing, configuration, dependencies, or production behavior warrants it. The API has no lint script.
- For documentation-only work, format/check changed Markdown and validate file links, commands, and factual claims against the repository.
- Review the final diff for accidental formatting churn, generated artifacts, secrets, and unrelated edits. Preserve pre-existing work when removing changes caused by your tools.
- Report what changed, checks actually run, and any failures or unverified behavior. Never claim a blocked or skipped check passed. Fix regressions introduced by the task; identify unrelated failures separately.

## Keep README context current

Updating documentation is part of completing a major change, not optional follow-up work.

- A major change includes adding/removing a feature or route, changing API payloads or permissions, altering authentication/state flows, adding schema models or migrations, changing environment/setup/deployment requirements, changing test/build commands or important dependencies, or reorganizing architecture/shared modules.
- Update `web/README.md` for frontend changes and `api/README.md` for backend changes in the same task. Update both for changes to cross-package contracts, setup, or end-to-end user flows.
- Update root `README.md` when a major change affects available features, user workflows, technology, local setup, or development commands. Keep it approachable for users and developers, with detailed implementation context in the package READMEs.
- Update the relevant sections: project overview, implementation status, source map, setup/environment, routes/contracts, data/access behavior, verification, and known limitations. Remove obsolete instructions and promote a feature from mock/planned only after its real integration exists.
- Keep READMEs useful as standalone context for a new AI session. Link to authoritative files, describe current behavior, and avoid duplicated source listings, sensitive data, transient test results, or chronological session logs.
- Small internal refactors and cosmetic fixes need README edits only if they make documented context inaccurate. Check for documentation impact on every task.
- Update this file when repository-wide working conventions change; keep detailed package context in the READMEs.

## Completion checklist

- Requested behavior or documentation is complete and consistent across affected files.
- Appropriate formatting, type checks, tests, and other checks have been run and their results reviewed.
- Affected READMEs reflect major changes and distinguish implemented functionality from mocks and planned work.
- The final diff preserves unrelated user work, and the handoff states any remaining limitations.

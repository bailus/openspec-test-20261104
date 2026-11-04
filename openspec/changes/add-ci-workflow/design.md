# Design

## Context

- An untracked draft, `.github/workflows/tests.yml`, already exists in the working tree. It triggers on `push` to `branches: ['**']` and has two jobs: `frontend` (Node LTS, `npm ci`, `npm run lint`, `npx tsc -b`, `npm test`) and `backend` (Postgres 17 service, `uv sync --locked`, `uv run manage.py test`). This design adopts it and lists the changes it needs.
- Tooling: Oxlint (`npm run lint`, config `.oxlintrc.json`), TypeScript `~7.0.2` with project references (`tsconfig.json` → `tsconfig.app.json`, `tsconfig.node.json`, both `noEmit: true`), Vitest (`npm test` = `vitest run`), uv with `uv.lock`, Python ≥ 3.13.
- `config/settings.py` requires `SECRET_KEY` and `DATABASE_URL` from the environment (it reads `.env` only if present; `.env` is git-ignored, so CI must set them). Under `manage.py test`, django-vite is forced into dev mode, so backend tests do **not** need a Vite build or `dist/manifest.json`.
- Django's test runner creates a `test_<name>` database, so the Postgres role needs `CREATEDB`. The `postgres` image's `POSTGRES_USER` is a superuser, so this holds.

## Goals / Non-Goals

**Goals:**
- One workflow file, two parallel jobs (frontend, backend), each check a named step.
- CI commands match the commands developers run locally.

**Non-Goals:**
- Matrix builds across Node or Python versions.
- Running `npm run build` / `collectstatic` in CI (the type check covers `tsc -b`; a production build check can come later).
- `pull_request` triggers: every PR in this repo comes from a pushed branch, which already gets a run.

## Decisions

1. **Adopt the existing draft rather than rewrite.** It already meets most requirements; changes are small and reviewable as a diff.

2. **Trigger: `push` with `branches: ['**']`.** `'**'` matches branch names containing `/` (e.g. `feature/x`), which `'*'` would not. Tag pushes are excluded because a `branches` filter is set. Alternative, a bare `on: push`, would also run on tags, which is not wanted.

3. **Two jobs, not one.** Frontend and backend have unrelated toolchains and run in parallel; a frontend failure does not hide backend results (spec: "Failures reported per check"). Within the frontend job, lint → type check → tests run as separate steps; a failing step stops later steps in that job. To still report all three frontend checks on one failure, mark the type-check and test steps `if: ${{ !cancelled() }}` so they run after an earlier step fails (but not when the run was cancelled). Alternative: three separate frontend jobs — rejected because each would repeat checkout and `npm ci`.

4. **Add `"typecheck": "tsc -b"` to `package.json`** and call `npm run typecheck` in CI instead of `npx tsc -b`. Keeps the command in one place and gives developers the same entry point. `tsc -b` (not `tsc --noEmit`) is required because the root `tsconfig.json` has `"files": []` and only references the sub-projects. Build info goes to `node_modules/.tmp`, so nothing is written to the source tree.

5. **Concurrency: `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`.** Grouping by ref cancels superseded runs on the same branch only.

6. **Backend env as plain workflow `env`, no secrets.** `SECRET_KEY` is a throwaway CI-only value, `DATABASE_URL` points at the service container on `localhost:5432`. `DEBUG: 'False'` matches how tests run anyway.

7. **Python version from the project.** `astral-sh/setup-uv` + `uv sync --locked` installs a Python satisfying `requires-python` and fails if `uv.lock` is stale. `npm ci` gives the equivalent lockfile guarantee for npm.

8. **Lint warnings fail, via the `lint` script itself.** Change `package.json` to `"lint": "oxlint --deny-warnings"` and keep CI calling `npm run lint`, so a developer's local lint fails in exactly the cases CI does. Alternatives: pass `--deny-warnings` only in the workflow (local `npm run lint` would pass while CI fails — confusing), or promote every rule to `error` in `.oxlintrc.json` (has to be repeated for each new rule and loses the warn/error distinction in editor output). `--max-warnings=0` is equivalent; `--deny-warnings` reads more clearly.

9. **Clear the one existing warning.** Today the tree has exactly one warning: `react/only-export-components` at `src/components/ui/button.tsx:63`, because the shadcn button file exports `buttonVariants` alongside `Button`. Nothing else imports `buttonVariants`, so drop it from the export list. If a component later needs it, move it to its own non-component module (e.g. `button-variants.ts`) rather than re-exporting it from the component file. Alternatives: an inline disable comment, or turning the rule off — both hide a real Fast Refresh issue.

10. **Least privilege.** Add top-level `permissions: contents: read`; the workflow only needs to check out code.

11. **Action versions.** Keep the draft's major-version tags (`actions/checkout@v5`, `actions/setup-node@v5`, `astral-sh/setup-uv@v6`). Pinning to commit SHAs is stricter but adds upkeep; not needed for this repo now.

## Risks / Trade-offs

- [TypeScript 7 / `lts/*` drift: Node LTS changes over time] → `npm ci` uses the lockfile, so only the Node runtime moves; if a break appears, pin `node-version` to a major (e.g. `24`).
- [Warnings now block pushes from going green, including warnings from new rules or an Oxlint upgrade that adds default rules] → Intended. `npm ci` pins the Oxlint version, so new warnings only appear when the lockfile changes, and `npm run lint` shows them locally first.
- [shadcn components added later (`npx shadcn add …`) often export variant helpers and will warn] → Fix as in decision 9 when adding them; CI will flag it.
- [`if: !cancelled()` steps run after a failed `npm ci` and fail too] → Noise only; the first failing step is still the root cause in the log.
- [Postgres service startup race] → The draft's `pg_isready` health check makes the job wait until the database accepts connections.
- [Workflow cannot be fully verified locally] → Verify each command locally, then confirm with a real push (tasks include this).

## Migration Plan

Commit the workflow, script and README together and push a branch. Rollback is deleting `.github/workflows/tests.yml`. Optional follow-up outside the repo: require the `Frontend` and `Backend` checks in `master`'s branch protection.

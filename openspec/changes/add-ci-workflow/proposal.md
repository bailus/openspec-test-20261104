# Proposal

## Why

Lint, type and test failures are only caught if someone remembers to run `npm run lint`, `tsc -b`, `npm test` and `uv run manage.py test` locally before pushing. Nothing checks a branch once it is on GitHub, so a broken commit can sit on any branch, including `master`, unnoticed. Running the checks automatically on every push gives each branch a pass/fail status on GitHub.

## What Changes

- Add a GitHub Actions workflow that runs on a push to any branch.
- The workflow runs, as separately reported steps, the frontend lint (Oxlint), the TypeScript type check (`tsc -b` across the app and tooling projects) and the frontend tests (Vitest).
- The workflow also runs the Django backend tests against a throwaway PostgreSQL service, so "tests" covers both halves of the app.
- A failure in any check fails the run, and GitHub shows the failure on the pushed commit. Lint **warnings** count as failures, not just errors.
- `npm run lint` changes to fail on warnings too, so local and CI lint agree. The one existing warning (`react/only-export-components` in `src/components/ui/button.tsx`, which exports the unused `buttonVariants`) is fixed so the tree starts clean.
- Add an `npm run typecheck` script so the CI type check and the local command are the same, and document the checks in the README.
- An untracked draft at `.github/workflows/tests.yml` already exists in the working tree; this change adopts it as the starting point rather than writing a second workflow.

Out of scope: running on pull requests from forks, deploying, building or publishing artifacts, branch protection rules (configured in GitHub settings, not the repo), and coverage reporting.

## Capabilities

### New Capabilities
- `ci-checks`: Automated quality checks GitHub runs on pushed commits: which events trigger them, which checks run, and how failures are reported.

### Modified Capabilities
<!-- None: the app's behaviour does not change. -->

## Impact

- New: `.github/workflows/tests.yml` (adopting the existing untracked draft, with the adjustments in design.md).
- `package.json`: new `typecheck` script; `lint` script now fails on warnings (a local behaviour change for developers).
- `src/components/ui/button.tsx`: stop exporting `buttonVariants` (not imported anywhere) to clear the existing lint warning.
- `README.md`: scripts table and a short "Continuous integration" note.
- No application behaviour, dependencies or settings change. The backend job relies on the existing `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` and `DATABASE_URL` environment variables read by `config/settings.py`.
- Uses GitHub Actions minutes on the `bailus/openspec-test-20261104` repository.

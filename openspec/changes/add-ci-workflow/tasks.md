# Tasks

## 1. npm scripts

- [x] 1.1 Add `"typecheck": "tsc -b"` to `package.json` scripts and verify `npm run typecheck` exits 0 on the current tree and writes nothing outside `node_modules/.tmp` (`git status` shows only `package.json` changed)
- [x] 1.2 Remove `buttonVariants` from the export list in `src/components/ui/button.tsx` and verify `npx oxlint` reports 0 warnings and `npm run typecheck` and `npm test` still pass
- [x] 1.3 Change the `lint` script to `oxlint --deny-warnings` and verify `npm run lint` exits 0 on the current tree, and exits non-zero when a temporary warning is introduced (e.g. re-add the `buttonVariants` export), then undo the temporary change
- [x] 1.4 Update the README scripts table: add `npm run typecheck` and note that `npm run lint` fails on warnings as well as errors; verify the table lists lint, typecheck and test

## 2. Workflow

- [x] 2.1 Update the existing `.github/workflows/tests.yml`: keep the `push` / `branches: ['**']` trigger and both jobs; add top-level `permissions: contents: read` and `concurrency` (`${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`); verify the file parses as YAML (e.g. `python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" .github/workflows/tests.yml` or `actionlint` if available)
- [x] 2.2 In the frontend job, replace `npx tsc -b` with `npm run typecheck` and add `if: ${{ !cancelled() }}` to the type-check and test steps; verify by reading the job that lint, type check and tests are three named steps
- [x] 2.3 Verify each CI command passes locally from a clean install: `npm ci && npm run lint && npm run typecheck && npm test`, and `uv sync --locked && uv run manage.py test` against the local database
- [x] 2.4 Add a short "Continuous integration" section to the README describing what runs on push (lint — warnings fail too, type check, frontend tests, Django tests) and where to see results (the Actions tab / commit status); verify the commands it names match the workflow

## 3. Verify on GitHub

- [ ] 3.1 Commit on a new branch and push it; verify in the Actions tab that a run starts for the branch and both `Frontend` and `Backend` jobs pass
- [ ] 3.2 Push a temporary commit with a deliberate type error; verify the type-check step fails, the lint and test steps still report, the backend job still passes, and the commit shows a failing status. Then revert it and verify the next run passes
- [ ] 3.3 Push a temporary commit that adds a lint warning but no error; verify the lint step fails and the commit shows a failing status. Then revert it
- [ ] 3.4 Push twice in quick succession on the branch; verify the earlier run is cancelled and the later one completes

## Workflow follow-up

- Optionally require the `Frontend` and `Backend` checks in `master`'s branch protection (GitHub settings, outside this repo).
- Archive the change after review.

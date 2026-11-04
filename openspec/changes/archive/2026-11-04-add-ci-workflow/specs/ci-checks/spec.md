# Spec Delta

## Purpose

Defines the automated quality checks GitHub runs on commits pushed to the repository, so every branch shows whether its latest commit passes lint, type checking and tests.

## ADDED Requirements

### Requirement: Checks run on every branch push
The repository SHALL trigger the automated checks whenever commits are pushed to GitHub on any branch, including `master` and newly created branches, without manual action.

#### Scenario: Push to a feature branch
- **WHEN** a developer pushes one or more commits to a branch other than `master`
- **THEN** GitHub starts a check run for the pushed head commit

#### Scenario: Push to master
- **WHEN** commits are pushed to `master`
- **THEN** GitHub starts a check run for the pushed head commit

#### Scenario: Pushing a new branch
- **WHEN** a developer pushes a branch that did not previously exist on GitHub
- **THEN** GitHub starts a check run for that branch's head commit

### Requirement: Frontend lint check
The check run SHALL lint the frontend source with the project's configured linter and lint rules, and SHALL fail when the linter reports any error or any warning.

#### Scenario: Lint error present
- **WHEN** a pushed commit contains code that violates a lint rule configured as an error
- **THEN** the lint check fails and the check run fails

#### Scenario: Lint warning present
- **WHEN** a pushed commit has no lint errors but violates a lint rule configured as a warning
- **THEN** the lint check fails and the check run fails

#### Scenario: Lint passes
- **WHEN** a pushed commit has no lint errors and no lint warnings
- **THEN** the lint check passes

### Requirement: TypeScript type check
The check run SHALL type-check every TypeScript project in the repository (the app and its build tooling configuration) using the project's TypeScript settings, and SHALL fail on any type error.

#### Scenario: Type error in app code
- **WHEN** a pushed commit contains a TypeScript type error in the app source
- **THEN** the type check fails and the check run fails

#### Scenario: Type error in tooling config
- **WHEN** a pushed commit contains a type error in a tooling file such as the Vite config
- **THEN** the type check fails and the check run fails

### Requirement: Frontend tests
The check run SHALL run the full frontend unit and component test suite once, non-interactively, and SHALL fail if any test fails.

#### Scenario: Failing frontend test
- **WHEN** a pushed commit causes a frontend test to fail
- **THEN** the frontend test check fails and the check run fails

### Requirement: Backend tests
The check run SHALL run the full Django backend test suite against a PostgreSQL database provided for the run, and SHALL fail if any test fails. It SHALL NOT require secrets or a database outside the check run.

#### Scenario: Failing backend test
- **WHEN** a pushed commit causes a Django test to fail
- **THEN** the backend test check fails and the check run fails

#### Scenario: No repository secrets configured
- **WHEN** the repository has no GitHub Actions secrets configured
- **THEN** the backend tests still run to completion

### Requirement: Failures reported per check
Each check (lint, type check, frontend tests, backend tests) SHALL be reported separately in the run, so a failure identifies which check failed. All checks SHALL be reported even when another check has already failed in a separate job, and the pushed commit SHALL show a failing status on GitHub when any check fails.

#### Scenario: Only the type check fails
- **WHEN** a pushed commit has a type error but passes lint and all tests
- **THEN** the run identifies the type check as the failing check
- **AND** the commit's status on GitHub is failing

#### Scenario: Frontend and backend failures are independent
- **WHEN** a pushed commit fails a frontend check
- **THEN** the backend tests still run and report their own result

### Requirement: Install from lockfiles
The check run SHALL install JavaScript and Python dependencies exactly as recorded in the committed lockfiles, and SHALL fail if a lockfile is out of date with its manifest.

#### Scenario: Lockfile out of sync
- **WHEN** `package.json` or `pyproject.toml` declares a dependency that its lockfile does not match
- **THEN** the dependency install fails and the check run fails

### Requirement: Superseded runs are cancelled
When a newer commit is pushed to a branch while a check run for an older commit on the same branch is still in progress, the older run SHALL be cancelled. Runs on different branches SHALL NOT cancel each other.

#### Scenario: Quick successive pushes
- **WHEN** a developer pushes to a branch and pushes again before the first run finishes
- **THEN** the first run is cancelled and the second run completes

#### Scenario: Pushes to different branches
- **WHEN** pushes to two different branches happen at the same time
- **THEN** both runs complete

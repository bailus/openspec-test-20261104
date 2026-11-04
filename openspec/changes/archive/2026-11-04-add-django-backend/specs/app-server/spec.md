# Spec Delta

## Purpose

Defines how the backend server delivers the tic-tac-toe web app to the browser, in development and from a production build, and how the server connects to its database.

## ADDED Requirements

### Requirement: App served at the site root
The backend server SHALL respond to `GET /` with an HTML page that loads and mounts the tic-tac-toe app. The page SHALL have the title "Vibe-tac-slop" and the existing favicon.

#### Scenario: Opening the app
- **WHEN** a browser requests `/` from the backend server
- **THEN** the server responds with status 200 and an HTML page
- **AND** the page loads the app's scripts and styles and the game board appears

#### Scenario: Page metadata
- **WHEN** the page served at `/` has loaded
- **THEN** the browser tab shows the title "Vibe-tac-slop" and the logo favicon

### Requirement: Theme applied before first paint
The page served by the backend SHALL apply the saved or system colour theme before the app's scripts run, as the `color-theme` capability requires.

#### Scenario: Saved dark theme
- **WHEN** the user has previously chosen the dark theme and requests `/`
- **THEN** the page's root element has the dark theme class before the app mounts, so no light-theme flash is shown

### Requirement: Live reload in development
When the server runs in development mode alongside the frontend dev server, the page SHALL load the app's source from the frontend dev server, and edits to frontend source files SHALL appear in the open page without a manual reload.

#### Scenario: Editing a component
- **WHEN** both servers are running in development mode, the app is open from the backend server, and a developer saves a change to a React component
- **THEN** the change appears in the open page without a full reload, keeping the current game state

#### Scenario: Editing styles
- **WHEN** a developer saves a change to a stylesheet
- **THEN** the new styles apply in the open page without a full reload

### Requirement: Built assets served by the backend
When the server runs in production mode, the page SHALL load the hashed script and style files produced by the frontend build, and the backend server SHALL serve those files itself. No frontend dev server SHALL be needed.

#### Scenario: Production page
- **WHEN** the frontend has been built, the backend runs with development mode off, and a browser requests `/`
- **THEN** the page references the built, content-hashed asset files under the static URL
- **AND** each of those files, the favicon and the logo are returned by the backend server with status 200

#### Scenario: Missing build
- **WHEN** the backend runs with development mode off and no frontend build exists
- **THEN** requesting `/` returns status 500 rather than a page with broken asset links
- **AND** the server log names the missing build manifest

### Requirement: PostgreSQL database
The backend server SHALL store its data in the PostgreSQL database whose connection settings come from the environment. The settings SHALL NOT be hard-coded in source; a committed example file SHALL document them.

#### Scenario: Connected database
- **WHEN** the environment names the local `openspec20261104` database and credentials and the database schema is migrated
- **THEN** the server starts and its database check reports no problems

#### Scenario: Unreachable database
- **WHEN** the configured database cannot be reached
- **THEN** commands that need the database fail with an error naming the connection problem

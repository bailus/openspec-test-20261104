# container-deployment Specification

## Purpose

Defines how the app runs in production from containers on a single server, so an operator with only Docker and a checkout of the repository can start, configure, update and restart it.

## Requirements

### Requirement: Single-command start
From a checkout of the repository with production settings in place, `docker compose up` SHALL build what it needs and start the app with its own database. Once started, the app SHALL be reachable over plain HTTP on host port 80 unless the operator configures a different host port.

#### Scenario: First start on a fresh server
- **WHEN** an operator on a server with Docker and the Compose plugin clones the repository, provides the required production settings and runs `docker compose up -d`
- **THEN** the app image is built, the app and database start, and `GET http://<server>/` returns status 200 with the Vibe-tac-slop page

#### Scenario: Custom host port
- **WHEN** the operator sets the host port setting to `8080` and starts the stack
- **THEN** the app answers on port 8080 of the server and nothing listens on port 80 for it

### Requirement: Production mode
The containerised app SHALL run with development mode off, serve the built and content-hashed frontend assets itself, and run under a production WSGI server. It SHALL NOT start or need a frontend dev server or Node.js at runtime.

#### Scenario: Built assets served
- **WHEN** the stack is running and a browser loads `/`
- **THEN** the page references content-hashed asset files under `/static/`, each returned by the app with status 200, and the game board appears

#### Scenario: No debug pages
- **WHEN** a request is made to a URL that does not exist
- **THEN** the response is a plain 404 with no debug information, settings or stack traces

### Requirement: Required production settings
The stack SHALL take the secret key, allowed host names and database password from operator-provided configuration outside version control. If any of them is missing or empty, it SHALL refuse to start and name the missing setting. The built image SHALL NOT contain secrets or the developer's `.env` file.

#### Scenario: Missing secret
- **WHEN** the operator runs `docker compose up` without a secret key configured
- **THEN** no container starts and the error names the missing setting

#### Scenario: Request for an unlisted host
- **WHEN** the stack runs with allowed hosts `example.com` and a request arrives with `Host: other.test`
- **THEN** the app responds with status 400

#### Scenario: Image contents
- **WHEN** the built app image's filesystem is inspected
- **THEN** it contains no `.env` file and no secret key or database password

### Requirement: Persistent bundled database
The stack SHALL run its own PostgreSQL database. Its data SHALL persist across container restarts, rebuilds and `docker compose down` / `up` cycles, as long as the volumes are kept. The database port SHALL NOT be published on the host network.

#### Scenario: Data survives a rebuild
- **WHEN** data has been written to the database, and the operator runs `docker compose down` and then `docker compose up -d --build`
- **THEN** the previously written data is still present

#### Scenario: Database not exposed
- **WHEN** the stack is running
- **THEN** a connection attempt from outside the containers to the PostgreSQL port on the server's host interfaces is refused

### Requirement: Schema migrated on start
The app SHALL wait until the database accepts connections, then apply any pending database migrations, and only then start serving requests.

#### Scenario: First start
- **WHEN** the stack starts against an empty database volume
- **THEN** the migrations are applied before the app serves its first request, and the server's database check reports no problems

#### Scenario: Update with new migrations
- **WHEN** the operator pulls a newer version of the repository that includes new migrations and runs `docker compose up -d --build`
- **THEN** the new migrations are applied before the updated app serves requests

### Requirement: Automatic restart
The app and database containers SHALL restart automatically after a crash, a Docker daemon restart or a server reboot, unless the operator stopped them deliberately.

#### Scenario: App process crashes
- **WHEN** the app container's main process exits unexpectedly
- **THEN** Docker restarts the container and the app serves requests again without operator action

#### Scenario: Server reboot
- **WHEN** the server reboots while the stack is running
- **THEN** both services are running again after Docker starts, and `/` returns status 200

### Requirement: Logs to standard output
The app SHALL write its request and error logs to the container's standard output or error streams, so that `docker compose logs` shows them.

#### Scenario: Viewing logs
- **WHEN** a request has been served and the operator runs `docker compose logs web`
- **THEN** the output includes the app server's log lines for that request or its startup

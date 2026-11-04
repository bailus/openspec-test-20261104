# Technology Stack and Software Supply Chain

## Project metadata

| Property | Value |
| --- | --- |
| Project | Tic-tac-toe (`tic-tac-toe`) |
| Package version | `0.0.0` |
| Package visibility | Private npm package |
| Application type | Django-served web application with a client-side React UI |
| JavaScript module format | ECMAScript modules |
| Package manager | npm (JavaScript), uv (Python) |
| Dependency lockfile | `package-lock.json` (lockfile version 3); `uv.lock` (Python) |

This inventory describes technologies declared by the repository. Dependency
versions in the tables are the ranges in `package.json`; `package-lock.json`
records the resolved versions, transitive dependency graph, registry URLs,
integrity hashes, and available license metadata. Use the lockfile as the
source of truth for a particular install.

## Application and runtime

| Technology | Version / metadata | Role |
| --- | --- | --- |
| React | `^19.3.1` | UI component model. |
| React DOM | `^19.3.1` | Mounts the React application in the browser DOM. |
| TypeScript | `~7.0.2` | Typed application and tooling source; compiled and type-checked for builds. |
| HTML | Django template `web/templates/web/index.html` | Browser document and application mount point. |
| CSS | CSS with Tailwind directives and custom properties | Application styles and theme tokens. |
| Browser DOM | Runtime platform | The game runs in the user's browser; Django serves the page and assets. |
| Python | `>=3.13` (`pyproject.toml`) | Backend runtime. |
| Django | 6.1.x (`uv.lock`) | Web framework serving the page and static files. |
| PostgreSQL | 17 (local server) | Database, `openspec20261104`; no application tables yet. |

The project README specifies Node.js 20 or later with npm for local development.
Node.js is used for development and build tooling; it is not the application's
browser runtime.

## Production dependencies

These are declared under `dependencies` in `package.json`.

| Package | Declared version | Purpose |
| --- | --- | --- |
| `@reduxjs/toolkit` | `^2.14.0` | Redux state-management utilities and store configuration. |
| `@tailwindcss/vite` | `^4.3.4` | Vite integration for Tailwind CSS v4. |
| `class-variance-authority` | `^0.7.1` | Defines component style variants. |
| `cn` | `^0.5.2` | Class-name utility used by the UI layer. |
| `lucide-react` | `^1.67.0` | React icon components; configured as the shadcn icon library. |
| `radix-ui` | `^1.8.1` | Accessible UI primitives used by interface components. |
| `react-redux` | `^9.3.1` | Connects React components to the Redux store. |
| `tailwindcss` | `^4.3.4` | Utility-first CSS framework. |

## Development and test dependencies

These packages are declared under `devDependencies` in `package.json`.

| Package | Declared version | Purpose |
| --- | --- | --- |
| `@testing-library/dom` | `^10.4.2` | DOM testing helpers. |
| `@testing-library/jest-dom` | `^7.0.1` | DOM assertions for tests. |
| `@testing-library/react` | `^16.3.3` | React component testing utilities. |
| `@testing-library/user-event` | `^14.6.8` | User interaction simulation in tests. |
| `@types/node` | `^24.19.2` | Node.js type definitions for tooling. |
| `@types/react` | `^19.3.0` | React type definitions. |
| `@types/react-dom` | `^19.3.0` | React DOM type definitions. |
| `@vitejs/plugin-react` | `^6.1.2` | React integration for Vite. |
| `jsdom` | `^30.1.3` | Browser-like DOM environment for tests. |
| `oxlint` | `^1.89.0` | JavaScript and TypeScript linter. |
| `shadcn` | `^4.23.0` | UI component tooling; project components and settings are in `src/components/ui/` and `components.json`. |
| `tw-animate-css` | `^1.4.0` | CSS animation utilities imported by the application stylesheet. |
| `typescript` | `~7.0.2` | TypeScript compiler and type checker. |
| `vite` | `^8.3.5` | Development server and production bundler. |
| `vitest` | `^5.1.0` | Test runner, configured to use jsdom. |

## Python dependencies

Declared in `pyproject.toml` and pinned in `uv.lock`; managed with uv.

| Package | Purpose |
| --- | --- |
| `django` | Web framework. |
| `django-vite` | Emits Vite script tags: dev-server URLs with hot reload in development, hashed built files from the manifest otherwise. |
| `psycopg[binary]` | PostgreSQL driver (psycopg 3). |
| `django-environ` | Reads settings from the environment and `.env`. |
| `whitenoise` | Lets Django serve static files and built assets when `DEBUG=False`. |
| `gunicorn` | Production WSGI server used in the container image. |

## Application architecture

| Area | Technology / implementation |
| --- | --- |
| UI | React components written in TypeScript/TSX. |
| State | Redux Toolkit store with React Redux provider and hooks. |
| Styling | Tailwind CSS v4, shadcn styling conventions, CSS custom properties, and `tw-animate-css`. |
| Icons | Lucide React. |
| Build and asset server | Vite with React and Tailwind CSS plugins; writes a manifest that django-vite reads. |
| Backend | Django (`config/` project, `web/` app) serving the page at `/`. |
| Tests | Vitest, jsdom, and Testing Library. |
| Linting | Oxlint, invoked by the `npm run lint` script. |

## Data, infrastructure, and external services

| Category | Inventory |
| --- | --- |
| Data stores | PostgreSQL database `openspec20261104` on localhost, configured through `DATABASE_URL`. Only Django's built-in tables exist; game and score state is still held in the client-side Redux store. |
| Backend / APIs | Django serves the page and static files. No API endpoints are declared. |
| Infrastructure as Code | `docker-compose.yml` (Docker Compose) defines the production `web` and `db` services and the `pgdata` volume. |
| Hosting / deployment | Single server running `docker compose up -d --build` from a checkout; gunicorn serves Django over plain HTTP, with built assets served by WhiteNoise. No TLS termination is included. |
| SaaS / commercial software | No SaaS or commercial runtime dependency is declared. npm and PyPI are the package registries referenced by the lockfiles. |
| Operating system / container | Multi-stage `Dockerfile` (`node:lts-slim` build stage, `python:3.13-slim` runtime, non-root user); database image `postgres:17`. Host OS is not specified; Docker Engine with the Compose plugin is required. |

“None identified” means no corresponding technology is declared in the project
files inspected; it does not assert that external services are not used outside
this repository.

## Software supply chain notes

- Direct dependency declarations and project scripts are maintained in
  `package.json` (npm) and `pyproject.toml` (Python).
- `uv.lock` pins the Python dependency tree with hashes; regenerate it with uv.
- `package-lock.json` pins the installed dependency tree and records integrity
  information and package metadata for direct and transitive npm packages.
- Review the lockfile's per-package metadata for resolved versions and license
  identifiers; this document does not replace a license or vulnerability scan.
- Regenerate the lockfile through npm when dependency manifests change, and
  commit it with the corresponding manifest updates.

# Battery Management System Web Platform

This monorepo contains a complete simulation of a web‑based Battery Management System (BMS).  It provides a **real‑time monitoring dashboard** for thousands of battery cells, implements role‑based access control for different stakeholders, and stores all telemetry in a PostgreSQL database for later analysis.

## Project Goals

The overarching aim of this project is to deliver a scalable, user‑friendly dashboard for a large battery pack.  It is designed to simulate 1,000 individual cells grouped into 100 packs and expose live telemetry (voltage, current, temperature and derived metrics) through a modern web interface.  Users can drill down from the pack level to individual cells, while moderators and administrators have access to fleet‑wide views, health reports and alert logs.  The architecture allows for future integration of machine‑learning algorithms and predictive analytics【166501968276858†L96-L147】.

## Repository Layout

```text
bms-web-platform/
├── .github/workflows       – CI/CD pipelines for deployment
├── database/migrations      – SQL migrations for PostgreSQL
├── packages/
│   ├── frontend/            – React single‑page application
│   ├── api/                 – Serverless API functions
│   └── realtime-engine/     – Stateful simulation & WebSocket server
├── .gitignore
├── package.json             – Monorepo definition and scripts
└── README.md                – This file
```

### Frontend

The `packages/frontend` folder hosts a React application built with functional components and Context API.  It includes:

- A **login page** where users, moderators and admins authenticate.
- **Dashboard** views that present real‑time telemetry, derived metrics such as State of Charge (SoC) and State of Health (SoH), and alerts for over‑temperature or undervoltage conditions【166501968276858†L74-L117】.
- Role‑specific pages:
  * **ModeratorView** – lists all batteries under a moderator’s care, with the ability to drill into packs and cells and generate fleet reports【166501968276858†L214-L234】.
  * **AdminPanel** – allows administrators to manage users and adjust system‑wide settings such as alert thresholds【166501968276858†L253-L259】.
- Custom hooks (`useAuth`, `useWebSocket`) and contexts (`AuthContext`, `DataContext`) to manage authentication state and incoming telemetry from the real‑time engine.
- Charts and gauges implemented with Chart.js to visualise trends and current values.

### API

The `packages/api` folder contains serverless functions designed to run on Vercel or Netlify.  These functions provide:

- **Authentication** (`/api/auth/login`) – verifies credentials, issues a JWT and returns role information.
- **Battery data endpoints** (`/api/battery/[id]`) – fetches the latest readings and metadata for a given battery or pack.
- **Fleet reports** (`/api/reports/fleet`) – summarises health metrics across all batteries and packs.
- **Admin tools** (`/api/admin/users`) – create or list users with their roles.

Middleware in `lib/auth.js` validates JWTs and enforces role‑based access, while `lib/db.js` centralises the PostgreSQL connection.

### Real‑Time Engine

The `packages/realtime-engine` directory implements a stateful Node.js service that simulates a large battery pack.  Its responsibilities include:

- Generating synthetic readings for 1,000 cells at a configurable interval, with realistic variations in voltage, current and temperature【166501968276858†L309-L320】.
- Computing derived metrics (SoC, SoH) and detecting anomalies based on simple thresholds【166501968276858†L109-L117】.
- Writing batches of readings into the PostgreSQL database via a `dbWriter` module.
- Broadcasting updates over WebSockets using rooms keyed by battery or pack ID.  The `webSocket` module authenticates clients and publishes only the data each user is authorised to see.

### Database Schema

Under `database/migrations` are SQL files that create the necessary schema:

1. **001_create_users_table.sql** – defines a `users` table with hashed passwords and role (user, moderator, admin).
2. **002_create_hierarchy_tables.sql** – creates tables for `batteries`, `packs` and `cells` with foreign keys to model the hierarchy【166501968276858†L283-L300】.
3. **003_create_readings_table.sql** – a time‑series table storing voltage, current, temperature, SoC and SoH for each cell at a timestamp.
4. **004_create_alerts_table.sql** – logs alerts and anomalies detected by the simulation engine, referencing the relevant cell or pack.

## Getting Started

The project is a monorepo managed with npm workspaces.  Each package has its own dependencies.

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Run development servers**
   ```sh
   npm start
   ```
   This concurrently starts the React development server, the API (serverless emulator) and the real‑time engine.  Ensure you have a PostgreSQL instance running and populate it using the SQL migrations.

3. **Database setup**
   Point the `DATABASE_URL` environment variable to your PostgreSQL instance and run the SQL files in `database/migrations` in order.  A migration tool such as `psql`, `knex` or `dbmate` can be used.

4. **Environment variables**
   Create a `.env` file in the root or in each package (as appropriate) with variables such as:

   ```ini
   DATABASE_URL=postgres://user:password@localhost:5432/bms
   JWT_SECRET=supersecretkey
   SIMULATION_INTERVAL=2000
   ```

## Future Work

This foundation emphasises clean architecture and separation of concerns.  Future enhancements might include:

- Integrating Kalman filters or neural‑network models for more accurate SoC estimation【166501968276858†L100-L145】.
- Adding geolocation tracking and map visualisation for moderators【166501968276858†L226-L229】.
- Expanding the alert engine to support dynamic thresholds and machine‑learning‑driven anomaly detection【166501968276858†L130-L147】.

The product requirements document, embedded in the repository, provides additional context and should be consulted when extending the system.
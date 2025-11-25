# PDQ

Full-stack demo combining a NestJS backend and a Vite/React client. Use
this guide to get the environment ready, run both apps locally, and
understand the architectural choices behind the project.

## Setup

1. **Dependencies**
   - Node.js 20.19+
   - npm 10+ (ships with Node)
   - Docker Desktop (PostgreSQL container)
   - Install concurrently as Dev Dependency
2. **Install packages**
   ```bash
   npm install
   ```
   This installs the root dependencies plus the workspaces under `backend`
   and `client`.
3. **Environment**
   - Copy any `*.env.example` files to `.env` (backend) and add your own
     values if needed.
   - Start PostgreSQL locally (example):
     ```bash
     docker run --name mydb -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
     ```

## Run

Start the client and Backend:

```bash
root of the project
npm run dev
```

Run backend tests:

```bash
cd backend
npm test
```

## Decisions

- **Monolithic API gateway**: kept services together to maximize delivery
  speed and simplify deployment.
- **Database via Docker**: assumes local Docker is available for parity
  with cloud Postgres.
- **Vite SPA**: thin client that talks to the gateway; no server-side
  rendering required for this scope.

## Quick Decision Matrix

I chose a monolithic architecture because it’s the fastest and simplest way to get a working system without over-engineering. It keeps development easy, ensures strong transactional consistency, and avoids the operational overhead of managing multiple services. At this stage, a monolith is more pragmatic I can deliver features quickly and later split into microservices only if real scaling needs appear.




# ADR-0001: Microservices with Coarse Local Deployment

- **Status:** Accepted
- **Date:** 2026-09-19
- **Deciders:** @hectorconcha-sw
- **Tags:** architecture, deployment, distributed-systems

## Context

Nexus is an ecommerce platform whose domain decomposes into bounded
contexts with genuinely different characteristics:

| Context       | Read:Write | Consistency | Failure impact             |
| ------------- | ---------- | ----------- | -------------------------- |
| Catalog       | 100:1      | Eventual    | High (blocks browsing)     |
| Cart          | 5:1        | Session     | Low (per-user)             |
| Orders        | 1:1        | Strict ACID | High (revenue-blocking)    |
| Payments      | 1:1        | Strict ACID | Critical (external system) |
| Inventory     | 10:1       | Strong      | High (over-sell risk)      |
| Notifications | 1:100      | Eventual    | None (user-invisible)      |
| Analytics     | 1:1000     | Eventual    | None                       |

These differences are real, not manufactured. Payments and Notifications
have opposite correctness requirements. Catalog and Analytics have opposite
read patterns. Hosting them in one deployable forces compromises that will
eventually have to be undone.

At the same time, the project is developed by a single engineer on a laptop.
A full microservices topology in local development — one Postgres instance
per service, one container per service, the full observability stack —
consumes 4–6 GB of RAM before the first line of domain code runs. That is
a real cost paid on every iteration, for a benefit (independent scaling,
failure isolation between processes) that cannot be exercised locally
anyway.

We must decide how much of the microservices topology to realize locally,
without compromising the architecture that will run in production.

## Decision

We adopt microservices as the architectural target, and we split the
decision across three independent axes:

### Code — fine-grained

Each bounded context lives in its own directory under `services/<name>/`
with its own `package.json`, its own `tsconfig.json`, its own module
graph, and its own internal structure. No cross-service imports. No shared
internal libraries beyond `packages/` (contracts, event schemas, logger).

### Data — fine-grained

**Each service owns its own database.** Not a schema — a database. In
local development, one Postgres _process_ hosts multiple databases
(`nexus_auth`, `nexus_catalog`, `nexus_orders`, etc.), but no two services
share a database, a schema, a table, or a migration history. Cross-service
SQL is prohibited; every cross-service read happens through an API or an
event. Each service has its own role with grants only on its own database.

In production, each service connects to its own RDS instance. The
connection string is the only thing that changes; the code is identical.

### Deployment — coarse locally, fine in production

**Local development:** a single Node process boots every service as a
separate NestJS application on a distinct port. One command
(`pnpm dev`) starts the whole system. The entrypoint lives at
`apps/all-services/src/main.ts` and does the equivalent of:

    for (const service of services) {
      const app = await NestFactory.create(service.module);
      await app.listen(service.port);
    }

Each service still has its own `main.ts` (`services/<name>/src/main.ts`)
for standalone boot. Local co-location is a _convenience_, not the
architecture.

**Production:** each service is deployed as its own container, own
Kubernetes Deployment, own replica count, own resource limits. The
entrypoint is `services/<name>/src/main.ts`. No code changes between
local and production — only the entrypoint differs.

### Communication

Unchanged by the deployment decision:

- **Synchronous** via HTTP for queries that need a response.
- **Asynchronous** via Kafka for state-change events.
- Distributed transactions via **saga orchestration** (Temporal).
- Every mutating endpoint supports **idempotency keys**.
- **OpenTelemetry** traces and **Prometheus** metrics from the first
  service, correlated by trace ID.

## Consequences

### Positive

- **Local development is cheap.** One Node process, one Postgres
  container, one Redis container. Fits comfortably on a laptop with
  Docker Desktop and 8 GB RAM. Fast iteration, fast startup.
- **The two axes that matter most are still fine-grained.** Code
  boundaries and data ownership are exactly what they'd be in a full
  microservices deployment. The parts of the architecture that resist
  retrofitting are already correct.
- **No cross-service shortcuts are possible.** Even though services
  share a process, they cannot share database tables or call each
  other's internal functions — the boundaries are enforced by the code
  structure and by the database grants.
- **The switch to full fine deployment is one file.** Replacing
  `apps/all-services/src/main.ts` with per-service containers is a
  deployment change, not an architectural one.
- **Demonstrates judgment.** The ADR explicitly reasons about the
  trade-off. A reviewer sees a considered decision, not a default.

### Negative

- **Process isolation is not exercised locally.** A memory leak in one
  service can affect others. A crash in one service can take down all
  of them. Neither failure mode can be reproduced locally the way it
  would occur in production.
- **Port management is manual.** Each service binds a distinct port.
  Adding a service means choosing an unused port and documenting it.
- **Trace topology is flattened.** Locally, spans from different
  services share a process. In production, they span hosts. The
  distinction rarely matters, but it exists.
- **Kubernetes manifests are untested locally.** The production
  Deployment YAMLs, probes, and resource limits are aspirational until
  they run somewhere.

### Neutral

- Kafka, Redis, Temporal, and the observability stack are required
  regardless of the deployment axis. The choice affects how many
  _application_ processes run, not how many _infrastructure_ processes
  run.
- The repository layout (`services/<name>/`, `packages/<name>/`) is
  identical in both topologies.
- Local Postgres hosting multiple databases is not a compromise on the
  data axis — it's the same ownership model production uses, just with
  fewer processes.

## Alternatives Considered

### Alternative A — Fine deployment locally (one container per service)

Every service runs as its own Docker container with its own entrypoint,
matching production topology exactly.

**Rejected because:**

- Local RAM usage grows linearly with service count. Six Postgres
  instances plus six Node containers plus Kafka plus Redis plus the
  observability stack exceeds 4 GB before any domain code runs.
- Independent scaling cannot be tested locally anyway — there is no
  load generator, no autoscaler, no meaningful traffic.
- Process isolation failures (OOM in one service, crash cascades) are
  interesting in production, not on a laptop.
- The cost is paid on every iteration, for a capability that cannot be
  exercised.
- The architectural fidelity gained over Alternative B is a container
  boundary, not a code or data boundary — the parts that matter.

### Alternative B — Coarse code and coarse data

Build a modular monolith: one NestJS application, one module per
context, one Postgres database, in-process method calls between modules.

**Rejected because:**

- Extraction to services is a rewrite, not a refactor: cross-context
  transactions become sagas, shared schema becomes per-service
  migrations, in-process calls become HTTP contracts. Every step is
  harder once the domain is mature.
- Boundaries in a monolith survive only by discipline. In a solo
  project, "just this once" is easy.
- The competency being demonstrated is distributed-systems design. A
  monolith, however well-modularized, does not demonstrate it.

### Alternative C — Fine on all three axes, including local data

One Postgres instance _per service_ locally, one Node container _per
service_, matching production exactly.

**Rejected because:**

- It is Alternative A with more containers and more YAML. Same rejection
  reasons apply.
- The additional fidelity (separate Postgres processes locally) does not
  correspond to any production failure mode that cannot be reproduced
  with separate databases on a shared instance.

### Alternative D — Fine code, coarse data, fine deployment

Services deploy independently but share a Postgres instance with
schema-per-service.

**Rejected because:**

- Shared Postgres instance couples services at the connection-pool,
  backup, and migration-tooling levels. A schema migration for one
  service is a cross-service event.
- Schema-per-service still allows cross-schema queries at the database
  level. Preventing them requires discipline, not architecture.
- Loses the ability to choose the right datastore per service
  (ClickHouse for analytics, Elasticsearch for catalog).
- This is the most common microservices antipattern and produces a
  distributed monolith.

## Notes

- **Sequencing:** "Microservices" describes the target architecture, not
  the order of delivery. The first deployable services will be `auth`
  and `catalog`. Each subsequent service arrives in its own reviewable
  PR. At no point do we build a monolith and later split it.
- **Bootstrap arrangement:** During the infrastructure bootstrap phase
  (PRs #2–#4), the single Postgres container hosts a shared `nexus`
  database used by Adminer and migration tooling. As each service
  lands, it receives its own database on the same instance and stops
  using the shared one. By the time all services are present, the
  shared `nexus` database is unused and is dropped.
- Related upcoming ADRs:
  - `0002` — Inter-service communication: HTTP vs events
  - `0003` — Database-per-service and role-based access
  - `0004` — Saga orchestration with Temporal
  - `0005` — Idempotency key design

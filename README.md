# nexus

Production-grade distributed ecommerce platform · NestJS, Next.js, Kafka, Temporal, Postgres, OpenTelemetry · Fully self-hostable via Docker Compose

## 🖥 Local Development

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) with
at least 8 GB RAM allocated.

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

First run builds the auth and catalog images (~3 minutes). Subsequent runs start in seconds.

### Running services

| Service | URL | Credentials |
|---|---|---|
| **Kong API Gateway** | http://localhost:8000 | — |
| Kong Admin API | http://localhost:8100 | — |
| Auth API (direct) | http://localhost:4001 | — |
| Catalog API (direct) | http://localhost:4002 | — |
| Postgres | `localhost:5432` | `nexus` / `nexus_dev_password` |
| Redis | `localhost:6379` | password: `nexus_dev_password` |
| Adminer (Postgres UI) | http://localhost:8080 | Server: `postgres`, user/pass as above |
| RedisInsight (Redis UI) | http://localhost:8001 | Host: `redis`, password: `nexus_dev_password` |
| Grafana | http://localhost:3000 | `admin` / `admin` |
| Prometheus | http://localhost:9090 | — |
| Tempo | http://localhost:3200 | — |

All client traffic should go through the gateway on port 8000. The direct
service ports (4001, 4002) are kept open for local debugging only.

To stop the stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml down      # keeps data
docker compose -f docker-compose.yml -f docker-compose.observability.yml down -v   # removes volumes (DESTROYS DATA)
```

To tail logs from a specific service:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml logs -f auth
```

## 🔌 API

All endpoints are exposed through Kong on port 8000.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe (routed to auth) |
| `POST` | `/api/v1/auth/register` | Create a new user, returns a JWT |
| `POST` | `/api/v1/auth/login` | Authenticate, returns a JWT |
| `GET` | `/api/v1/products` | List products (supports `?status=`, `?category=`, `?limit=`, `?offset=`) |
| `GET` | `/api/v1/products/:slug` | Fetch a product by slug |
| `POST` | `/api/v1/products` | Create a product |
| `GET` | `/api/v1/categories` | List categories with product counts |
| `GET` | `/api/v1/categories/:slug` | Fetch a category by slug |
| `POST` | `/api/v1/categories` | Create a category |

### Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","displayName":"Jane Doe"}'
```

Response:

```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### List products

```bash
curl http://localhost:8000/api/v1/products
```

### Create a category

```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","slug":"electronics","description":"Devices and gadgets"}'
```

### Create a product

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse","slug":"wireless-mouse","sku":"WM-001","priceCents":2999,"categoryId":"<category-id>"}'
```

### Health

```bash
curl http://localhost:8000/health
```

### Gateway features

Every response includes:

- `X-Request-Id` — correlation ID, propagated to all downstream services
- `X-RateLimit-Limit-Minute` / `X-RateLimit-Remaining-Minute` — rate limit headers (600 req/min per IP)

## 🔍 Observability

Grafana is pre-provisioned with Prometheus, Loki, and Tempo as data sources.

- **Traces** — every request produces a trace spanning Kong → service → database
- **Metrics** — Prometheus scrapes the OTel collector, which receives OTLP from all services
- **Logs** — Loki is ready; services currently emit to stdout (structured logging via OTel is a future PR)

Explore in Grafana: http://localhost:3000 → Explore tab.

## 🏗 Architecture

Each bounded context is its own service with its own database. All external
traffic flows through Kong. See [`docs/adr/`](./docs/adr/) for the reasoning
behind major decisions.

| Service | Responsibility | Status |
|---|---|---|
| `gateway` | API gateway, routing, rate limiting | ✅ Implemented |
| `auth` | Identity, JWT issuance, user registration | ✅ Implemented |
| `catalog` | Products, categories | ✅ Implemented |
| `cart` | Shopping cart state | 🚧 Planned |
| `orders` | Order lifecycle, saga orchestration | 🚧 Planned |
| `payments` | Stripe integration, refunds | 🚧 Planned |
| `inventory` | Stock levels, reservations | 🚧 Planned |
| `notifications` | Email, in-app messaging | 🚧 Planned |
| `analytics` | Event ingestion, reporting | 🚧 Planned |
| `web` | Customer storefront (Next.js) | 🚧 Planned |
| `admin` | Admin panel (Next.js) | 🚧 Planned |

## 📜 License

MIT © 2026 Hector Concha
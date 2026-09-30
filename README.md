# nexus

Production-grade distributed ecommerce platform · NestJS, Next.js, Kafka, Temporal, Postgres, OpenTelemetry · Fully self-hostable via Docker Compose

## 🖥 Local Development

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) with
at least 4 GB RAM allocated.

```bash
cp .env.example .env
docker compose up -d
```

First run will build the auth service image (~2 minutes). Subsequent runs start in seconds.

### Running services

| Service                 | URL                   | Credentials                                   |
| ----------------------- | --------------------- | --------------------------------------------- |
| Postgres                | `localhost:5432`      | `nexus` / `nexus_dev_password`                |
| Redis                   | `localhost:6379`      | password: `nexus_dev_password`                |
| Auth API                | http://localhost:4001 | —                                             |
| Adminer (Postgres UI)   | http://localhost:8080 | Server: `postgres`, user/pass as above        |
| RedisInsight (Redis UI) | http://localhost:8001 | Host: `redis`, password: `nexus_dev_password` |

To stop the stack:

```bash
docker compose down      # keeps data
docker compose down -v   # removes volumes (DESTROYS DATA)
```

To tail logs from a specific service:

```bash
docker compose logs -f auth
```

## 🔌 API

The auth service exposes the following endpoints. All are prefixed with `/api/v1` except `/health`.

| Method | Path                    | Description                      |
| ------ | ----------------------- | -------------------------------- |
| `GET`  | `/health`               | Liveness probe                   |
| `POST` | `/api/v1/auth/register` | Create a new user, returns a JWT |
| `POST` | `/api/v1/auth/login`    | Authenticate, returns a JWT      |

### Register

```bash
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","displayName":"Jane Doe"}'
```

Response:

```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### Login

```bash
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Health

```bash
curl http://localhost:4001/health
```

## 🏗 Architecture

Each bounded context is its own service with its own database. See
[`docs/adr/`](./docs/adr/) for the reasoning behind major decisions.

| Service         | Responsibility                            | Status         |
| --------------- | ----------------------------------------- | -------------- |
| `auth`          | Identity, JWT issuance, user registration | ✅ Implemented |
| `gateway`       | API gateway, rate limiting                | 🚧 Planned     |
| `catalog`       | Products, categories, search              | 🚧 Planned     |
| `orders`        | Order lifecycle, saga orchestration       | 🚧 Planned     |
| `payments`      | Stripe integration, refunds               | 🚧 Planned     |
| `inventory`     | Stock levels, reservations                | 🚧 Planned     |
| `notifications` | Email, in-app messaging                   | 🚧 Planned     |
| `analytics`     | Event ingestion, reporting                | 🚧 Planned     |

## 📜 License

MIT © 2026 Hector Concha

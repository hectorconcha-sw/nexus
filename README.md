# nexus

Production-grade distributed ecommerce platform · Next.js, NestJS, Kong, PostgreSQL, Redis, OpenTelemetry · Fully self-hostable via Docker Compose

## 🖥 Local Development

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) with at least 8 GB RAM allocated.

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

First run builds the application images (~3-5 minutes). Subsequent runs start in seconds.

### Running services

| Service                 | URL                   | Credentials                                   |
| ----------------------- | --------------------- | --------------------------------------------- |
| **Web Storefront**      | http://localhost:3000 | —                                             |
| **Kong API Gateway**    | http://localhost:8000 | —                                             |
| Kong Admin API          | http://localhost:8100 | —                                             |
| Auth API (direct)       | http://localhost:4001 | —                                             |
| Catalog API (direct)    | http://localhost:4002 | —                                             |
| Cart API (direct)       | http://localhost:4003 | —                                             |
| Inventory API (direct)  | http://localhost:4004 | —                                             |
| Postgres                | `localhost:5432`      | `nexus` / `nexus_dev_password`                |
| Redis                   | `localhost:6379`      | password: `nexus_dev_password`                |
| Grafana                 | http://localhost:3030 | `admin` / `admin`                             |
| Prometheus              | http://localhost:9090 | —                                             |
| Tempo                   | http://localhost:3200 | —                                             |
| Adminer (Postgres UI)   | http://localhost:8080 | Server: `postgres`, user/pass as above        |
| RedisInsight (Redis UI) | http://localhost:8001 | Host: `redis`, password: `nexus_dev_password` |

All client traffic goes through Kong on port 8000. Direct service ports (4001-4004) are kept open for debugging.

To stop the stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml down      # keeps data
docker compose -f docker-compose.yml -f docker-compose.observability.yml down -v   # removes volumes (DESTROYS DATA)
```

## 🔌 API

All endpoints are exposed through Kong on port 8000.

### Auth

- `POST /api/v1/auth/register` — Create a user (returns Access & Refresh tokens)
- `POST /api/v1/auth/login` — Authenticate
- `POST /api/v1/auth/refresh` — Rotate tokens
- `POST /api/v1/auth/logout` — Revoke session

### Catalog

- `GET /api/v1/products` — List products
- `GET /api/v1/products/:slug` — Get product
- `POST /api/v1/products` — Create product
- `GET /api/v1/categories` — List categories

### Cart

- `GET /api/v1/cart` — Get current cart (requires `x-cart-id` header)
- `POST /api/v1/cart/items` — Add item to cart
- `DELETE /api/v1/cart/items/:productId` — Remove item

### Inventory

- `POST /api/v1/inventory/stock` — Set initial stock for a product
- `GET /api/v1/inventory/stock/:productId` — Check current stock
- `POST /api/v1/inventory/reserve` — Atomically reserve stock for checkout (returns Reservation ID)
- `POST /api/v1/inventory/reserve/:id/release` — Release a reservation (restores stock)

## 🔐 Architecture & Security

- **BFF Authentication**: The Next.js frontend acts as a Backend-for-Frontend. The browser stores Access and Refresh tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies. Middleware performs silent token refreshes on the server, completely neutralizing XSS token theft.
- **Microservices**: Each service owns its own database (Postgres for Auth/Catalog/Inventory, Redis for Cart).
- **Atomic Stock Reservations**: The Inventory Service uses Postgres transactions to prevent race conditions and over-selling during checkout.
- **Observability**: Full OpenTelemetry tracing across Kong, Next.js, and all NestJS services, exported to Tempo, Prometheus, and Loki.

| Service     | Responsibility                           | Status         |
| ----------- | ---------------------------------------- | -------------- |
| `web`       | Customer Storefront (Next.js 15)         | ✅ Implemented |
| `gateway`   | Kong API Gateway, routing, rate limiting | ✅ Implemented |
| `auth`      | Identity, JWT, Refresh Token rotation    | ✅ Implemented |
| `catalog`   | Products, Categories                     | ✅ Implemented |
| `cart`      | Redis-backed shopping cart               | ✅ Implemented |
| `inventory` | Stock levels, atomic reservations        | ✅ Implemented |
| `orders`    | Order lifecycle, Temporal Saga           | 🚧 In Progress |
| `payments`  | Stripe integration                       | 🚧 Planned     |

## 📜 License

MIT © 2026 Hector Concha

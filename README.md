# 🛒 Grocery Store API

REST API for an online grocery store, built with **NestJS** and **Prisma**.

## Features

- 🔐 **Auth**: registration and login with JWT access and refresh tokens (refresh tokens are hashed and stored in Redis), plus logout
- 👮 **Role-based access**: `USER` / `ADMIN`; only admins manage products
- 📦 **Products**: full CRUD with stock quantity and price
- 🛍 **Cart**: add, update, remove and clear items, with stock validation
- 🧾 **Orders**: create an order from the cart, list orders, get one order, cancel an order
- 💳 **Payments**: Stripe Checkout sessions, and a signature-verified webhook that marks orders as `PAID`
- ✅ Global validation (`class-validator`), a Prisma exception filter, and a global JWT guard with a `@Public()` decorator

## Tech Stack

NestJS 11 · TypeScript · Prisma 7 · PostgreSQL 16 · Redis 7 · Stripe · Passport JWT · Docker Compose

## Data Model

`User` · `Cart` · `CartItem` · `Product` · `Order` · `OrderItem`
Order statuses: `PENDING_PAYMENT` → `PAID` / `CANCELED` / `FAILED`

## API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/registration`, `/auth/login`, `/auth/refresh` | Public |
| POST | `/auth/logout` | User |
| GET | `/products`, `/products/:id` | User |
| POST / PATCH / DELETE | `/products`, `/products/:id` | Admin |
| GET | `/cart` | User |
| POST / PATCH / DELETE | `/cart/items`, `/cart/items/:productId` | User |
| POST / GET | `/orders`, `/orders/:orderId` | User |
| POST | `/orders/:id/checkout` | User |
| PATCH | `/orders/:id/cancel` | User |
| POST | `/stripe/webhook` | Public (Stripe signature) |

## Getting Started

```bash
yarn install
docker compose up -d          # PostgreSQL + Redis
npx prisma migrate dev
yarn start:dev
```

Create a `.env` file with `DATABASE_URL`, the JWT secrets, the Redis connection, `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.

## Roadmap

- [x] Monolith version
- [ ] Split into microservices (NestJS + RabbitMQ)

# Backend Technical Diagnostic Report

**Project:** `projeto-web/backend`  
**Branch audited:** `feat/backend-e2e-tests`  
**Audit date:** June 9, 2026  
**Scope:** Full read-only review of routes, controllers, services, repositories, middleware, Prisma schema, migrations, Redis, cron, and config.

---

## Executive Summary

The backend follows a recognizable layered architecture and covers the core domain (auth, demands, organs, admin, metrics). Prisma modeling is rich and well-indexed. Redis and cron for metrics consolidation are implemented with graceful fallbacks.

The main gaps are **inconsistent layer boundaries** (Prisma and business logic in controllers), **authorization holes** on demand endpoints, **Redis not used for JWT blocklist** despite being documented, **no refresh-token strategy**, **missing profile creation** when admins create users, and **several schema models with no API usage**. Overall maturity: **partially production-ready**, with security and consistency fixes needed before hardening.

| Area | Verdict |
|------|---------|
| Architecture | **Partially meets** |
| Prisma / Data Modeling | **Partially meets** |
| Data Persistence | **Partially meets** |
| REST API | **Partially meets** |
| Authentication | **Partially meets** |
| Roles & Permissions | **Partially meets** |
| Redis | **Partially meets** |
| Cron Jobs | **Partially meets** |
| Code Quality | **Partially meets** |

---

## 1. Backend Architecture

### Folder Tree

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/          (3 migrations)
├── src/
│   ├── config/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── cron.ts
│   ├── controllers/         (9 controllers)
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── requireRole.ts
│   │   └── errorMiddleware.ts
│   ├── repositories/        (2 only: organ, metrics)
│   ├── routes/              (8 route modules)
│   ├── services/            (10 services)
│   ├── utils/
│   │   └── cache.ts
│   └── server.ts
├── package.json
└── .env.example
```

### What Was Found

**Positive patterns:**

- Routes are thin and delegate to controllers (`authRoutes.ts`, `adminRoutes.ts`, etc.).
- Most controllers delegate to services (`demandController` → `demandService`, `adminController` → `adminService`).
- Repository layer exists for organs and metrics (`organRepository.ts`, `metricsRepository.ts`).
- Global error handler is registered last in `server.ts`.

**Violations:**

| Violation | Evidence |
|-----------|----------|
| Business logic + DB access in controller | `gestorController.ts` — all 4 handlers query `prisma` directly (lines 22–230) |
| Controller bypasses service layer | `userController.listarUsuarios` queries `prisma.usuario` directly (lines 13–26) instead of `userService` |
| Inconsistent repository usage | Only `organService` and `metricsService` use repositories; all other services call `prisma` directly |
| Duplicated status-update logic | `gestorController.atualizarStatusChamado` vs `demandService.updateStatus` — two paths, different permission checks |
| Duplicated user-listing logic | `userController.listarUsuarios` vs `adminService.listUsers` |
| Async validation not awaited | `organService.criarOrgao` calls `this.validarCamposObrigatorios(dados)` without `await` (line 61) — validation errors become unhandled rejections |

### Verdict: **Partially meets**

Layers exist and are mostly respected, but `gestorController` and `userController` break the pattern. Adding features in those areas requires touching controllers, not services.

---

## 2. Data Modeling with Prisma

### Models and Relationships

| Model | Relationships | Notes |
|-------|---------------|-------|
| `usuario` | 1:1 `cidadao`, `gestor`, `admin` | Central identity table |
| `cidadao` | 1:1 `usuario`, 1:N `chamado` | Required for demand creation |
| `gestor` | 1:1 `usuario`, N:1 `orgao`, 1:1 `manager_profile` | Required for gestor routes |
| `admin` | 1:1 `usuario` | Exists in schema; never populated by services |
| `chamado` | N:1 `cidadao`, `categoria`, `gestor?`, `orgao?` | Core demand entity |
| `categoria` | N:M `orgao` via `orgao_categoria` | |
| `orgao` | 1:N `gestor`, `chamado`, `routing_rules` | |
| `regra_competencia` | N:1 `categoria`, `orgao` (principal/secundário) | Legacy routing |
| `routing_rules` | N:1 `categoria`, `orgao` | New routing (English naming) |
| `timeline_event` | N:1 `chamado` | Audit trail per demand |
| `notificacao` | N:1 `usuario`, `chamado?` | No API exposure |
| `manager_profile` | 1:1 `gestor` | No API exposure |
| `notification_preference` | N:1 `manager_profile` | No API exposure |
| `audit_logs` | N:1 `usuario` (admin) | Used by admin actions |
| `metrics_snapshot` | Standalone JSON snapshots | Used by cron |
| `usuario_audit` | N:1 `usuario` | **Orphaned — no service usage** |

### Schema Strengths

- Foreign keys and cascades are defined correctly in `schema.prisma`.
- Extensive partial indexes on `chamado` (status, gestor, SLA, dashboard queries).
- Enums map DB values correctly (`perfil`, `status_chamado`, `prioridade`).
- Migration `20260609000001` correctly made `chamado.orgaoid` nullable.

### Schema Issues

| Issue | Evidence |
|-------|----------|
| **Dual routing systems** | `regra_competencia` (used in `demandService.update`) vs `routing_rules` (used in `demandService.create`) — inconsistent routing logic |
| **Naming inconsistency** | Portuguese (`usuario`, `chamado`) vs English (`routing_rules`, `audit_logs`, `metrics_snapshot`) |
| **`admin` table unused** | Model at `schema.prisma:11-18`; no service creates `admin` rows |
| **Orphan models** | `usuario_audit`, `notificacao`, `manager_profile`, `notification_preference` — no `src/` references |
| **`gestorid` never set on create** | `demandService.create` does not assign a gestor to new demands |
| **Duplicate indexes** | `idx_chamado_gestor` and `idx_chamado_gestor_status_recentes` are identical definitions |

### ORM Usage

- No raw SQL (`$queryRaw` / `$executeRaw`) found — good.
- **Mild anti-pattern:** `metricsRepository.averageResponseTime` fetches all resolved `chamado` records with timeline events, then filters/averages in JS (`metricsService.ts:10-25`). Justified by timeline analysis, but costly at scale.
- `metricsRepository.demandsByCategory` correctly uses `groupBy`.
- Pagination uses `skip`/`take` at DB level — good.

### Verdict: **Partially meets**

Modeling is thorough and indexed, but dual routing, orphaned tables, and naming drift reduce consistency.

---

## 3. Data Persistence

### CRUD Coverage

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| Demands (`chamado`) | ✅ | ✅ | ✅ | ⚠️ Soft delete | Via `/demands` |
| Categories | ❌ | ✅ | ❌ | ❌ | Read-only API |
| Organs | ✅ | ✅ | ✅ | ❌ | Status toggle only |
| Users (admin) | ✅ | ✅ | ✅ (role/status) | ❌ | No hard delete |
| Users (self-register) | ✅ | ✅ | ❌ | ❌ | Auth register |
| Routing rules | ✅ | ❌ | ✅ | ❌ | No list/get endpoint |
| Audit logs | ✅ (auto) | ✅ | ❌ | ❌ | Append-only |
| Metrics snapshots | ✅ (cron) | ❌ | ❌ | ❌ | No read API |

### Transactions (Good)

- `authService.register` — `usuario` + `cidadao` in `$transaction` (`authService.ts:28-44`)
- `demandService.create/update/updateStatus/deleteDemand` — chamado + `timeline_event` atomically

### Integrity Gaps

| Gap | Severity | Evidence |
|-----|----------|----------|
| Admin-created `Cidadao` has no `cidadao` row | **High** | `adminService.createUser` only creates `usuario` (lines 192-209); `demandService.create` requires `cidadao` profile (lines 281-284) |
| Admin-created `Gestor` has no `gestor` row | **High** | Same; gestor routes fail with 404 |
| Organ create not transactional | Medium | `organService.criarOrgao` — org + categories are separate calls (lines 99-102) |
| `orgaoid` can be null silently | Medium | `resolveOrgan` returns null, demand still created (`demandService.ts:45-55, 306`) |
| `latitude`/`longitude` default to `0` | Low | `demandService.create` lines 310-311 |
| Role change doesn't sync profile tables | High | `adminService.updateUserRole` only updates `usuario.perfil` |
| Soft delete sets status `Fechado`, not a deleted flag | Low | `demandService.deleteDemand` lines 419-426 |

### Frontend ↔ DB Field Mapping

Demands use an English API surface mapped to Portuguese DB columns:

| API field | DB column |
|-----------|-----------|
| `title` | `subcategoria` |
| `description` | `descricao` |
| `location` | `endereco` |
| `category_id` | `categoriaid` |

Mapping is consistent in `demandService`, but increases cognitive load.

### Verdict: **Partially meets**

Core demand CRUD works with transactions and timeline logging. Admin user creation breaks profile integrity, and several modeled entities have no persistence path through the API.

---

## 4. REST API

### Endpoint Inventory

| Method | Path | Auth | Role Guard | Status Codes Used |
|--------|------|------|------------|-------------------|
| GET | `/health` | Public | — | 200 |
| POST | `/auth/register` | Public | — | 201, 400, 409 |
| POST | `/auth/login` | Public | — | 200, 400, 401, 403 |
| POST | `/auth/logout` | JWT | — | 200 |
| GET | `/auth/me` | JWT | — | 200, 401, 404 |
| GET | `/demands` | JWT | — | 200 |
| POST | `/demands` | JWT | `Cidadao` | 201, 400, 403 |
| GET | `/demands/:id` | JWT | — | 200, 403, 404 |
| PUT | `/demands/:id` | JWT | `Cidadao` | 200, 403, 404 |
| PATCH | `/demands/:id/status` | JWT | `Gestor` | 200, 400, 404 |
| DELETE | `/demands/:id` | JWT | `Gestor` | 204, 404 |
| GET | `/categories` | JWT | — | 200 |
| GET | `/categories/:id` | JWT | — | 200, 400, 404 |
| GET | `/users` | JWT | `Gestor` | 200 |
| GET | `/users/:id` | JWT | `Gestor` | 200, 400, 404 |
| GET | `/gestor/dashboard` | JWT | `Gestor` | 200, 401, 404 |
| GET | `/gestor/chamados` | JWT | `Gestor` | 200 |
| GET | `/gestor/chamados/:id` | JWT | `Gestor` | 200, 403, 404 |
| PUT | `/gestor/chamados/:id/status` | JWT | `Gestor` | 200, 400, 403, 404 |
| GET | `/metrics/total-demands` | JWT | `Gestor` | 200 |
| GET | `/metrics/demands-by-category` | JWT | `Gestor` | 200 |
| GET | `/metrics/average-response-time` | JWT | `Gestor` | 200 |
| GET | `/admin/organs` | JWT | `Admin`, `Gestor` | 200, 400 |
| POST | `/admin/organs` | JWT | `Admin` | 201, 409 |
| PUT | `/admin/organs/:id` | JWT | `Admin` | 200, 404, 409 |
| PUT | `/admin/organs/:id/:status` | JWT | `Admin` | 200, 400, 404 |
| GET | `/admin/users` | JWT | `Admin` | 200 |
| POST | `/admin/users` | JWT | `Admin` | 201, 400, 409 |
| PATCH | `/admin/users/:id/activate` | JWT | `Admin` | 200, 400 |
| PATCH | `/admin/users/:id/deactivate` | JWT | `Admin` | 200, 400 |
| PATCH | `/admin/users/:id/role` | JWT | `Admin` | 200, 400 |
| POST | `/admin/routing-rules` | JWT | `Admin` | 201, 400 |
| PUT | `/admin/routing-rules/:id` | JWT | `Admin` | 200, 400 |
| GET | `/admin/audit-logs` | JWT | `Admin` | 200 |

### HTTP Method Usage

Generally correct. Minor issues:

- `PUT /admin/organs/:id/:status` — status in URL path is unconventional; `PATCH` with body would be more RESTful.
- Two status-update endpoints for demands: `PATCH /demands/:id/status` and `PUT /gestor/chamados/:id/status`.

### Response Standardization

**Inconsistent error shapes:**

| Source | Format |
|--------|--------|
| `errorMiddleware` | `{ error, statusCode, timestamp, details? }` |
| `authMiddleware` | `{ error }` only — no `statusCode` or `timestamp` |
| `requireRole` | `{ error, statusCode, timestamp }` |
| `organController` | `{ message }` — different key |
| `adminController` (inline) | `{ error }` without timestamp |
| Success responses | Mixed: raw objects, `{ data }`, `{ chamado }`, `{ usuarios }` |

### Error Handling

- Global handler exists: `errorMiddleware.ts` — maps `AppError`, Prisma errors, JWT errors.
- `authMiddleware` and some controllers respond directly, **bypassing** the global handler.
- `asyncHandler` wrapper exists but is **unused** — every controller uses manual `try/catch`.

### Verdict: **Partially meets**

Endpoints are functional and methods are mostly correct, but response shapes vary and error handling is split between middleware and inline responses.

---

## 5. Authentication

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Registration validates fields | ✅ Meets | `authController.register` lines 12-25 |
| Password hashed with bcrypt, ≥10 rounds | ✅ Meets | `bcrypt.hash(senha, 10)` — `authService.ts:26` |
| Default role `Cidadao` assigned | ✅ Meets | `perfil: 'Cidadao'` — `authService.ts:34` |
| No token returned on register | ✅ Meets | Returns user object only — `authController.ts:29` |
| Login uses `bcrypt.compare` | ✅ Meets | `authService.ts:66-69` |
| JWT payload `{ id, email, perfil }` | ✅ Meets (uses `perfil` not `role`) | `authService.ts:75-80` |
| Expiration from `.env` | ✅ Meets | `JWT_EXPIRATION` — `authService.ts:10-11, 82` |
| JWT in HttpOnly cookie | ✅ Meets | `authController.ts:46-51` |
| `Secure` flag | ✅ Meets (production only) | `secure: process.env.NODE_ENV === 'production'` |
| `SameSite=Strict` | ✅ Meets | `sameSite: 'strict'` |
| Token not in response body | ✅ Meets | Login returns user data only |
| Logout clears cookie | ✅ Meets | `res.clearCookie('token')` — `authController.ts:64` |
| Token blocklisted in Redis | ❌ **Does not meet** | In-memory `Set` — `authService.ts:13-14, 108-133` |
| Middleware validates JWT | ✅ Meets | `authMiddleware.ts:26-89` |
| Missing/invalid token → 401 | ✅ Meets | Lines 45-48, 92-108 |
| Refresh strategy | ❌ **Does not meet** | No refresh token; re-login required after expiry |
| `GET /auth/me` uses `req.user.id` | ✅ Meets | `authController.ts:78-85` |
| Never exposes `senha` | ✅ Meets | `select` excludes password — `authService.ts:91-98` |

### Security Gaps

1. **JWT blocklist is in-process memory** — ineffective across restarts or multiple instances; Redis is configured but not used for this.
2. **Cookie `maxAge` hardcoded to 24h** (`authController.ts:50`) — not synced with `JWT_EXPIRATION`.
3. **Fallback JWT secret hardcoded** — `authService.ts:7-8`, `authMiddleware.ts:8-9`.
4. **Bearer token accepted in header** — acceptable for API clients, but increases XSS exfiltration surface if ever stored in JS.
5. **Password policy weak** — minimum 6 characters (`authController.ts:23`), not 8+ with complexity.
6. **Inactive user check on login** — ✅ good (`authService.ts:59-64`), also re-checked on every request (`authMiddleware.ts:75-78`).

### Verdict: **Partially meets**

Cookie-based JWT auth is solid for a first version. Blocklist, refresh, and secret handling need hardening for production.

---

## 6. User Roles and Permissions

### Roles in System

Enum `perfil` in `schema.prisma:313-317`:

- `Cidadao` (maps to DB `"Cidadão"`)
- `Gestor`
- `Admin`

Stored in DB and included in JWT as `perfil`.

### `requireRole` Middleware

```typescript
const hierarchyMap: Record<string, string[]> = {
  Admin: ['Admin', 'Gestor', 'Cidadao'],
  Gestor: ['Gestor', 'Cidadao'],
  Cidadao: ['Cidadao'],
};
```

Admin inherits Gestor and Cidadao permissions. Implementation is hierarchy-based, not exact-role matching.

### Role-Protected Routes

| Route prefix | Required role(s) |
|--------------|------------------|
| `/demands` POST, PUT | `Cidadao` (Admin can too via hierarchy) |
| `/demands` PATCH status, DELETE | `Gestor` |
| `/gestor/*` | `Gestor` (Admin can too) |
| `/metrics/*` | `Gestor` (Admin can too) |
| `/users/*` | `Gestor` |
| `/admin/organs` GET | `Admin`, `Gestor` |
| `/admin/*` (everything else) | `Admin` |

### Can `Cidadao` Access Gestor/Admin Routes?

**Code analysis: No** — `requireRole` blocks correctly. A `Cidadao` JWT cannot pass `requireRole(['Gestor'])` or `requireRole(['Admin'])`.

### Permission Gaps and Inconsistencies

| Issue | Impact |
|-------|--------|
| `GET /demands` and `GET /demands/:id` have **no role guard** beyond auth | Gestor/Admin see **all** demands when `perfil !== 'Cidadao'` — `demandService.list` only filters by `cidadaoid` for Cidadao (line 64) |
| `PATCH /demands/:id/status` and `DELETE /demands/:id` don't verify gestor ownership | Any Gestor can change/delete any demand — `demandService.updateStatus/deleteDemand` have no `gestorid` check |
| `GET /users` lists **all** users to any Gestor | Includes admin emails — `userController.ts:13-26` |
| Admin can pass `requireRole(['Gestor'])` but `gestorController.dashboard` requires `gestor` DB row | Admin without gestor profile gets 404 — inconsistent with metrics routes that handle Admin differently |
| Role change limited to `Cidadao`/`Gestor` only | Cannot promote to Admin via API — intentional, but undocumented |
| Permissions not documented in code beyond route definitions | Self-evident only where `requireRole` is present |

### Verdict: **Partially meets**

RBAC middleware exists and blocks cross-role access at the route level, but **resource-level authorization** on demands and users is missing or inconsistent.

---

## 7. Redis

### Configuration

| Item | Status | Evidence |
|------|--------|----------|
| `REDIS_URL` in `.env.example` | ✅ | Line 40 |
| `config/redis.ts` with exportable client | ✅ | `getRedisClient()`, `isRedisAvailable()` |
| `getCache`, `setCache`, `deleteCache` | ✅ | `utils/cache.ts:5-38` |
| Graceful fallback | ✅ | Returns `null` / no-ops on failure |

### Usage Points

| File | Purpose | TTL |
|------|---------|-----|
| `metricsService.ts` | Cache for total/category/avg-response metrics | 5 min (`METRICS_CACHE_TTL`) |
| `metricsConsolidationService.ts` | Daily snapshot cache per scope | 24 hours |
| `demandService.ts`, `gestorController.ts` | Cache invalidation on demand changes | — |
| `authService.ts` | **Not used** — comment says "em produção: Redis" but uses in-memory `Set` | — |

### Technical Justification

| Use case | Justified? |
|----------|------------|
| Metrics endpoint caching | ✅ Yes — aggregation queries are expensive |
| Snapshot pre-computation | ✅ Yes — supports dashboard reads without recalculating |
| JWT blocklist | ❌ **Missing** — documented intent not implemented |

### Issues

1. Redis configured for cache/snapshots but **not for logout blocklist**.
2. Snapshot keys written by cron are **never read** by any endpoint — write-only cache.
3. No Redis connection health exposed in `/health`.
4. Blocklist in memory **breaks multi-instance** deployments (same as cron issue).

### Verdict: **Partially meets**

Infrastructure and cache utilities are well-built with fallbacks. JWT blocklist integration and snapshot read path are missing.

---

## 8. Cron Jobs

### Configuration

- File: `src/config/cron.ts`
- Registered on server start: `server.ts:46`
- Schedule: `CRON_METRICS_SCHEDULE` env var, default `0 * * * *` (hourly)

### Job: Metrics Consolidation

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Logic isolated in service | ✅ | `metricsConsolidationService.runMetricsConsolidation` |
| Configurable via `.env` | ✅ | `CRON_METRICS_SCHEDULE` |
| try/catch wrapper | ✅ | `metricsConsolidationService.ts:68-107` |
| Execution logged | ✅ | Success: line 85; failure: line 90 |
| Error persisted to DB | ✅ | Creates `metrics_snapshot` with `jobstatus: 'error'` |
| Multi-instance safe | ❌ | No distributed lock — N instances = N runs |
| Cron callback error handling | ⚠️ | `cron.ts:12-14` — unhandled rejection possible if `runMetricsConsolidation` throws outside its try/catch (it doesn't, but pattern is fragile) |

### What the Job Does

1. Computes platform-wide metrics snapshot → persists to PostgreSQL + Redis.
2. Iterates all gestores → computes per-gestor snapshots → Redis only (not DB per gestor).
3. Relevant and aligned with the metrics feature.

### Verdict: **Partially meets**

Well-structured single job with logging and DB error recording. Not safe for horizontal scaling without a lock mechanism.

---

## 9. Code Quality

### Strengths

- Readable service modules (`demandService`, `adminService`, `auditLogService`).
- `AppError` + centralized Prisma error mapping.
- Audit logging on sensitive admin actions.
- Sensible index design in Prisma schema.
- Redis/cache abstraction is clean and defensive.

### Weak Areas

| Area | Issue |
|------|-------|
| **Separation of concerns** | `gestorController` is effectively a service+controller hybrid |
| **Duplication** | Two demand status-update flows; two user-list implementations; two bcrypt libs (`bcrypt` + `bcryptjs`) |
| **Dead/orphan code** | `usuario_audit` model; `asyncHandler` unused; `admin` model unused; snapshot Redis keys unread |
| **Naming** | Mixed PT/EN across API, DB, and code (`perfil` vs `role`, `senha` vs `password`) |
| **Hardcoded secrets/defaults** | JWT secret fallback, `DATABASE_URL` fallback in `prisma.ts:6` |
| **Tests** | Jest configured (`jest.config.ts`) but **zero test files** in `src/` |
| **Seed** | Referenced in `package.json` and docs but `prisma/seed.ts` is `.gitignore`d — not auditable |
| **Environment** | `.env.example` contains example credentials (acceptable for example, risky if copied verbatim) |

### Top Issues by Impact

1. **Authorization gaps on `/demands`** — any Gestor can modify any demand.
2. **Admin user creation missing profile rows** — breaks downstream features.
3. **JWT blocklist in memory** — logout ineffective in multi-instance/production.
4. **`gestorController` architecture violation** — hardest module to maintain/extend.
5. **Dual routing rules** — unpredictable organ assignment.
6. **No automated tests** — regression risk on a growing API surface.

### Verdict: **Partially meets**

Readable and organized enough for a small team, but inconsistencies and missing tests reduce confidence for production deployment.

---

## Consolidated Suggested Fixes

*(Ordered by priority.)*

### P0 — Security & Data Integrity

1. Add resource-level checks in `demandService.list`, `findById`, `updateStatus`, and `deleteDemand` — filter by `gestorid` for Gestor, scope Admin explicitly.
2. Wrap `adminService.createUser` and `updateUserRole` in transactions that create/sync `cidadao`/`gestor` profile rows.
3. Move JWT blocklist to Redis (`setCache` with TTL = remaining token life) in `authService.addTokenToBlocklist` / `isTokenBlocked`.
4. Remove hardcoded `JWT_SECRET` and `DATABASE_URL` fallbacks — fail fast if env vars are missing in production.

### P1 — Architecture & Consistency

5. Extract `gestorController` logic into `gestorService`; inject repository where appropriate.
6. Unify demand status updates into one service method; expose via one route.
7. Consolidate routing to a single system (`routing_rules` or `regra_competencia`).
8. Standardize all error responses through `errorHandler` — remove inline `res.status().json()` in `authMiddleware`, `organController`.
9. Sync cookie `maxAge` with `JWT_EXPIRATION` (parse duration string).

### P2 — Operations & Quality

10. Add distributed lock (Redis `SET NX EX`) around `runMetricsConsolidation` for multi-instance safety.
11. Either expose snapshot read endpoints or remove unused Redis snapshot writes.
12. Add e2e/integration tests for auth, RBAC, and demand CRUD (Jest infrastructure already exists).
13. Commit `prisma/seed.ts` or document that it must be created locally.
14. `await this.validarCamposObrigatorios(dados)` in `organService.criarOrgao`.

### P3 — Nice to Have

15. Add refresh-token flow or document intentional session-only auth.
16. Remove duplicate bcrypt dependency (pick `bcrypt` or `bcryptjs`).
17. Add CRUD/list endpoints for `routing_rules`.
18. Clean up or wire orphaned models (`usuario_audit`, `notificacao`, `admin`).

---

## Final Assessment

This backend demonstrates a **working foundation** with thoughtful Prisma modeling, audit trails, metrics caching, and cron-based consolidation. It is **not yet audit-clean for production** due to authorization holes on demands, incomplete user-profile lifecycle, in-memory token revocation, and architectural inconsistencies in the gestor and user modules.

**Overall project grade: Partially meets requirements across all 9 sections**, with the highest-risk gaps concentrated in **permissions (Section 6)**, **auth blocklist (Section 5)**, and **data integrity on admin user creation (Section 3)**.

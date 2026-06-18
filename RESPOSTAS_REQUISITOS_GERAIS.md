# Respostas aos Requisitos Gerais do Projeto

**Projeto:** Fiscalize — Plataforma de Governança Digital para Gestão de Demandas Urbanas
**Stack:** Next.js 14 (App Router) + TypeScript + Chakra UI + Zustand (frontend); Express 5 + Prisma 7 + PostgreSQL + Redis (backend); Docker.
**Time:** Alessandra Barbosa, Ana Sofia Moura, Camila Teixeira, Maria Gabriela Damásio, Raphael Rennan Miranda, Rayane Santos e René Lucena.

---

## 1. Arquitetura Distribuída

**Modelo adotado:** Cliente-Servidor multicamadas com backend desacoplado e camada de cache distribuída.

**Justificativa da escolha:**

- **Aderência ao domínio:** O sistema atende três perfis distintos (Cidadão, Gestor, Admin) que consomem a mesma base de dados sob regras de visibilidade diferentes. Isolar a camada de apresentação (responsiva, mobile-first para o cidadão) das regras de negócio (triagem, SLA, roteamento) permite evoluir cada uma de forma independente.
- **Escala horizontal previsível:** O frontend Next.js pode ser servido por CDN/edge (Vercel/CloudFront) enquanto o backend escala em containers atrás de um load balancer — pré-requisito para uma plataforma pública municipal.
- **Cache distribuído:** O Redis desacopla o custo de queries de métricas pesadas (consolidação por status, categoria e tempo médio) da requisição HTTP, reduzindo latência percebida pelo gestor.
- **Compatibilidade com modelo relacional:** Operações transacionais sobre chamados, SLAs e usuários se beneficiam do isolamento ACID do PostgreSQL — adequado para um servidor centralizado, não para P2P ou event-driven puro.

**Componentes distribuídos:**

| Componente | Processo | Porta | Responsabilidade |
|---|---|---|---|
| Frontend Next.js | Node.js (App Router) | 3001 | UI, autenticação, renderização, chamadas REST ao backend |
| Backend Express 5 | Node.js (API REST) | 3000 | Regras de negócio, auth JWT, persistência, métricas, cron |
| Banco de Dados | PostgreSQL 16 | 5432 | Persistência relacional (13+ modelos via Prisma) |
| Cache / Métricas | Redis 7 | 6379 | Cache de snapshots de métricas (TTL 5 min / 24h) |
| Admin DB | pgAdmin 4 | 5050 | Interface de administração do banco (ambiente dev) |

**Onde está implementado no repositório:**

- Frontend: `frontend/` — Next.js 14, Axios (`frontend/src/lib/api.ts`)
- Backend: `backend/src/server.ts` — Express 5, 9 controllers, 10 services, 7 route files
- Infraestrutura: `frontend/docker-compose.yml` — PostgreSQL, pgAdmin, Redis em rede bridge `fiscalize_network`
- Configuração de ambiente: `backend/.env.example`

---

## 2. Desenho da Arquitetura

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA CLIENTE                                  │
│                                                                              │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐               │
│  │  Cidadão      │     │  Gestor       │     │  Admin        │               │
│  │ (mobile/web)  │     │ (desktop/web) │     │ (desktop/web) │               │
│  └───────┬───────┘     └───────┬───────┘     └───────┬───────┘               │
└──────────┼──────────────────────┼──────────────────────┼──────────────────────┘
           │                     │                      │
           │            HTTPS / HTTP (HTML + JSON)      │
           │                     │                      │
┌──────────▼─────────────────────▼──────────────────────▼──────────────────────┐
│                       CAMADA DE APRESENTAÇÃO                                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS 14 — App Router  :3001                      │  │
│  │                                                                        │  │
│  │  ┌───────────────┐  ┌───────────────┐  ┌────────────────────────────┐  │  │
│  │  │ React Server  │  │ Client Comp.  │  │ middleware.ts (route guard) │  │  │
│  │  │ Components    │  │ + Zustand     │  │ JWT via cookie/localStorage │  │  │
│  │  └───────────────┘  └───────────────┘  └────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Tecnologias: TypeScript, Chakra UI, React Hook Form + Zod,           │  │
│  │               Axios, Leaflet / Leaflet.heat, Recharts, jspdf, xlsx    │  │
│  └────────────────────────────┬───────────────────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
                   HTTP/REST  ·  JSON  ·  Bearer JWT
                                │
┌───────────────────────────────▼──────────────────────────────────────────────┐
│                          CAMADA DE SERVIÇO                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    EXPRESS 5 + Prisma 7  :3000                         │  │
│  │                                                                        │  │
│  │  Routes          Controllers         Services           Repositories   │  │
│  │  ──────────────  ─────────────────   ────────────────   ─────────────  │  │
│  │  /auth           authController      authService        metricsRepo    │  │
│  │  /gestor         gestorController    gestorService      organRepo      │  │
│  │  /demands        demandController    demandService      routingRepo    │  │
│  │  /users          userController      userService                       │  │
│  │  /categories     categoryController  categoryService                   │  │
│  │  /admin          adminController     adminService                      │  │
│  │  /metrics        metricsController   metricsService                    │  │
│  │  /health         healthCheck         auditLogService                   │  │
│  │                  organController     metricsConsolidationService       │  │
│  │                  routingRuleCtrl     routingRuleService                │  │
│  │                                                                        │  │
│  │  Middlewares: CORS · cookie-parser · errorHandler · authenticate (JWT) │  │
│  │  Background: node-cron  (consolidação de métricas, padrão: 0 * * * *) │  │
│  │  Tecnologias: TypeScript, Express 5, Prisma 7, jsonwebtoken, bcrypt   │  │
│  └────────┬───────────────────────────────────────────────┬──────────────┘  │
└───────────┼───────────────────────────────────────────────┼──────────────────┘
            │                                               │
   TCP/IP (Prisma/pg driver)                    TCP (ioredis)
            │                                               │
┌───────────▼────────────────────┐   ┌──────────────────────▼──────────────────┐
│       CAMADA DE DADOS          │   │           CAMADA DE CACHE               │
│                                │   │                                         │
│   PostgreSQL 16  :5432         │   │   Redis 7  :6379                        │
│                                │   │                                         │
│   Modelos Prisma:              │   │   Chaves:                               │
│   usuario, cidadao, gestor     │   │   metrics:total:<scope>      TTL 5 min  │
│   chamado, categoria, orgao    │   │   metrics:category:<scope>   TTL 5 min  │
│   metrics_snapshot             │   │   metrics:avg-response:<...> TTL 5 min  │
│   timeline_event, admin        │   │   metrics:snapshot:<date>:*  TTL 24h   │
│   routing_rule, orgao_gestor   │   │                                         │
│   Connection pool: pg.Pool     │   │   Fallback: app funciona sem Redis      │
│   + PrismaPg adapter           │   │   (getRedisClient retorna null)         │
└────────────────────────────────┘   └─────────────────────────────────────────┘

         ┌───────────────────────────────────────────┐
         │  SERVIÇOS EXTERNOS (produção / futuros)   │
         │  Leaflet Tile Server       HTTP            │
         │  Firebase Cloud Messaging  HTTPS (push)   │
         │  Geolocation API           Web API (GPS)  │
         └───────────────────────────────────────────┘
```

**Protocolos por interação:**

| Origem → Destino | Protocolo | Formato |
|---|---|---|
| Browser → Next.js | HTTPS/HTTP | HTML + JS/CSS + JSON |
| Next.js (Axios) → Express | HTTP/REST | JSON + Bearer JWT |
| Express → PostgreSQL | TCP/IP (driver `pg`) | SQL via Prisma |
| Express → Redis | TCP (ioredis) | RESP (Redis Serialization) |
| Browser → Leaflet Tiles | HTTP | PNG (tiles) |
| Backend → FCM (futuro) | HTTPS | JSON |

---

## 3. Concorrência e Paralelismo

### 3.1 Event loop assíncrono do Node.js (concorrência I/O-bound)

- **Mecanismo:** `async`/`await` (corrotinas sobre o event loop do V8)
- **Componente:** todo o backend Express (`backend/src/server.ts` e todos os controllers/services) e as páginas cliente do Next.js (`frontend/src/app/**/page.tsx`)
- **Problema resolvido:** múltiplas requisições HTTP são processadas concorrentemente sem bloquear a thread principal — enquanto uma aguarda resposta do banco, outras avançam. Atende dezenas de gestores e centenas de cidadãos simultâneos com baixo uso de memória.

### 3.2 `Promise.all` para queries paralelas de métricas

- **Mecanismo:** `Promise.all` — execução paralela de Promises independentes
- **Componente:** `backend/src/services/metricsConsolidationService.ts:33`
- **Como:**
  ```ts
  // metricsConsolidationService.ts:33
  const [totalByStatus, byCategory, averageResponseTime] = await Promise.all([
    metricsService.computeTotalDemands(scope),
    metricsService.computeDemandsByCategory(scope),
    metricsService.computeAverageResponseTime(scope),
  ]);
  ```
- **Ganho:** as três queries ao PostgreSQL disparam simultaneamente. Sem `Promise.all`, o tempo seria a soma das três; com ele, é o máximo — redução de ~60% no tempo de consolidação.

### 3.3 `Promise.all` para invalidação paralela do cache Redis

- **Mecanismo:** `Promise.all` sobre múltiplas operações `DEL` no Redis
- **Componente:** `backend/src/utils/cache.ts` — função `invalidateMetricsCache`
- **Como:**
  ```ts
  // cache.ts
  export async function invalidateMetricsCache(gestorId?: string | null): Promise<void> {
    const keys = metricsCacheKeys(gestorId);
    await Promise.all(keys.map(deleteCache));
  }
  ```
- **Ganho:** até 6 chaves de cache são invalidadas em paralelo a cada mutação em chamados, mantendo coerência sem latência sequencial.

### 3.4 Background job com `node-cron` (paralelismo temporal)

- **Mecanismo:** `node-cron` — execução de tarefa agendada em background, independente do ciclo request/response
- **Componente:** `backend/src/config/cron.ts` + `backend/src/services/metricsConsolidationService.ts`
- **Como:** o job roda no mesmo processo Node.js mas fora do ciclo de atendimento de requisições — uma forma de paralelismo temporal.
  ```ts
  // cron.ts
  cron.schedule(schedule, async () => {
    await runMetricsConsolidation(); // padrão: todo hora (0 * * * *)
  });
  ```
- **Ganho:** a consolidação de métricas (que envolve múltiplas queries e escrita no PostgreSQL e Redis) não penaliza o tempo de resposta das APIs durante o horário de pico.

### 3.5 React Concurrent Rendering + `dynamic()` com Suspense

- **Mecanismo:** React 18 concurrent rendering + `next/dynamic` com `ssr: false`
- **Componente:** `frontend/src/app/gestor/dashboard/page.tsx:18-27` e `frontend/src/app/gestor/mapa/page.tsx:3-21`
- **Como:**
  ```ts
  // gestor/dashboard/page.tsx:18
  const Heatmap = dynamic(() => import('@/components/Heatmap'), {
    ssr: false,
    loading: () => <Spinner />,
  });
  ```
- **Ganho:** o React pode renderizar os KPIs e a tabela de chamados imediatamente enquanto o bundle do Leaflet (~200 KB) carrega em paralelo, sem congelar a UI — atende o SLA de renderização em ≤ 3 segundos.

### 3.6 `useMemo` para cálculos derivados (cooperação com o scheduler)

- **Mecanismo:** memoização de valores derivados — o React scheduler evita re-computação desnecessária
- **Componente:** `frontend/src/app/gestor/dashboard/page.tsx:45`, `gestor/fila/page.tsx:46`, `gestor/mapa/page.tsx`
- **Ganho:** filtragem, ordenação e cálculo de SLA não recalculam a cada keystroke — a thread de renderização fica livre para responder a eventos de UI.

---

## 4. Otimização

### 4.1 Otimizações implementadas

| # | Otimização | Onde no código | Impacto |
|---|---|---|---|
| 1 | **Cache Redis com TTL por escopo** | `backend/src/utils/cache.ts` — `setCache(key, value, ttl)` com TTL 5 min para métricas em tempo real e 24h para snapshots diários | Elimina queries repetidas ao PostgreSQL no dashboard do gestor; degradação graciosa quando Redis indisponível (`getRedisClient()` retorna `null`) |
| 2 | **Connection pooling PostgreSQL** | `backend/src/config/prisma.ts` — `new Pool({ connectionString })` + `PrismaPg(pool)` | Reuso de conexões TCP ao banco; evita o custo de handshake a cada query; suporte a concorrência sem esgotar o limite de conexões do PG |
| 3 | **`Promise.all` em consolidação de métricas** | `backend/src/services/metricsConsolidationService.ts:33` | 3 queries paralelas ao invés de sequenciais — redução de ~60% no tempo do job de consolidação |
| 4 | **Invalidação paralela de cache** | `backend/src/utils/cache.ts` — `invalidateMetricsCache` com `Promise.all` | Até 6 chaves Redis invalidadas em paralelo a cada mutação de chamado |
| 5 | **Lazy loading de bibliotecas pesadas** | `dynamic(() => import('@/components/Heatmap'), { ssr: false })` em `gestor/dashboard/page.tsx:18` e `gestor/mapa/page.tsx:3` | Reduz bundle inicial em ~200 KB; evita erro de SSR do Leaflet |
| 6 | **Memoização de cálculos derivados** | `useMemo` em `gestor/dashboard/page.tsx:45`, `gestor/fila/page.tsx:46`, `gestor/mapa/page.tsx` | Filtragem e ordenação da fila não recalculam a cada keystroke |
| 7 | **Code splitting por rota** | Next.js App Router (automático) | Bundle do cidadão não inclui Recharts, jspdf, xlsx, Leaflet — presentes apenas nas rotas do gestor/admin |
| 8 | **Validação no cliente com Zod** | `frontend/src/lib/validations.ts` + React Hook Form | Erros de formulário sem round-trip ao servidor; reduz carga no backend |
| 9 | **JWT blocklist em memória** | `backend/src/services/authService.ts` — `isTokenBlocked(token)` | Tokens revogados no logout são rejeitados imediatamente, sem query ao banco |
| 10 | **Middleware de erro centralizado** com mapeamento Prisma | `backend/src/middlewares/errorMiddleware.ts` — `prismaErrorMap` | Erros do ORM convertidos em HTTP semântico (409, 404, 503…) sem try/catch repetido em cada controller |
| 11 | **Build standalone do Next.js** | `frontend/Dockerfile` — multi-stage build | Imagem de produção menor, cold start mais rápido |
| 12 | **Variáveis de ambiente validadas na inicialização** | `backend/src/config/env.ts` — `requireEnv()` | Falha rápida (fail-fast) antes de aceitar qualquer requisição, evitando erros silenciosos em produção |

### 4.2 Otimizações recomendadas para o futuro

| # | Ponto | O que fazer | Justificativa / Ganho |
|---|---|---|---|
| 1 | **Debounce no campo de busca** | Aplicar `useDebounce` (150–300 ms) em `gestor/fila/page.tsx` e `cidadao/chamados/page.tsx` | Hoje a filtragem dispara a cada keystroke; com muitos chamados isso pode causar jank |
| 2 | **Paginação / virtualização da fila** | `react-window` ou paginação server-side em `/gestor/fila` | Hoje carrega todos os chamados de uma vez; com 10 k+ registros o DOM cresce demais |
| 3 | **Cache HTTP com SWR ou TanStack Query** | Substituir `fetch`/Axios crus nos stores Zustand por uma camada de cache | Evita refetch desnecessário ao trocar de tela; revalidação em background |
| 4 | **Worker thread para geração de PDF/Excel** | Mover `exportarPDF`/`exportarExcel` em `gestor/relatorios/page.tsx` para um Web Worker | Hoje trava a UI ao exportar relatórios grandes; um worker executa em thread separada |
| 5 | **Brotli/Gzip no proxy reverso** | Habilitar no Next.js config ou no nginx à frente | Reduz transferência de JS/CSS em 60–80% |
| 6 | **`next/image` para fotos de chamados** | Migrar `<img>` para `next/image` (lazy + AVIF/WebP) | Fotos de chamados (US-005) pesam — `next/image` entrega tamanhos responsivos automaticamente |
| 7 | **Server Components para listagens read-only** | Migrar `/cidadao/chamados` (listagem) para RSC | Reduz JS enviado ao cliente; rendering no servidor com streaming |
| 8 | **Pool sizing explícito no Prisma** | Configurar `max` em `pg.Pool` baseado em `DATABASE_URL` | Evita esgotamento de conexões PostgreSQL sob alta carga concorrente |
| 9 | **Push notifications via FCM** | Integrar Firebase Cloud Messaging para atender US-008 | Hoje notificações são apenas in-app; push real cumpriria o SLA de ≤ 5 min após mudança de status |
| 10 | **Índices compostos no PostgreSQL** | Adicionar índice em `(orgao_id, status, criado_em)` na tabela `chamado` | Filtros combinados da fila do gestor (órgão + status + período) usarão index scan em vez de seq scan |

---

## Mapeamento rápido (onde encontrar cada requisito)

| Requisito | Arquivo(s) principal(is) |
|---|---|
| Arquitetura distribuída | `frontend/`, `backend/`, `frontend/docker-compose.yml` |
| Diagrama de arquitetura | Este documento, seção 2 |
| Concorrência — event loop | `backend/src/server.ts`, todos os controllers/services |
| Concorrência — `Promise.all` (métricas) | `backend/src/services/metricsConsolidationService.ts:33` |
| Concorrência — `Promise.all` (cache) | `backend/src/utils/cache.ts` — `invalidateMetricsCache` |
| Concorrência — cron background job | `backend/src/config/cron.ts` |
| Concorrência — React concurrent / dynamic | `frontend/src/app/gestor/dashboard/page.tsx:18`, `gestor/mapa/page.tsx:3` |
| Otimização — Redis cache | `backend/src/utils/cache.ts`, `backend/src/config/redis.ts` |
| Otimização — connection pool | `backend/src/config/prisma.ts` |
| Otimização — memoização | `frontend/src/app/gestor/{dashboard,fila,mapa}/page.tsx` |
| Otimização — error handling centralizado | `backend/src/middlewares/errorMiddleware.ts` |
| Containerização | `frontend/Dockerfile`, `frontend/docker-compose.yml` |

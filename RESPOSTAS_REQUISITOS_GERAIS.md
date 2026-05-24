# Respostas aos Requisitos Gerais do Projeto

**Documento de referência:** `Requisitos Gerais do Projeto.md`
**Projeto:** Fiscalize — Plataforma de Governança Digital para Gestão de Demandas Urbanas
**Stack auditada:** Next.js 14 (App Router) + TypeScript + Chakra UI + Zustand (frontend); Express 5 + Prisma 7 + PostgreSQL (backend planejado); json-server + MSW (mock layer); Docker.

---

## 1. Arquitetura Distribuída

**Modelo adotado:** Cliente-Servidor multicamadas com separação física entre apresentação, API mock e (em evolução) backend de persistência.

**Justificativa da escolha:**

- **Aderência ao domínio:** O sistema atende três perfis distintos (Cidadão, Gestor, Super Admin) que consomem a mesma base de dados sob regras de visibilidade diferentes. O modelo cliente-servidor isola a camada de apresentação (responsiva, mobile-first para o cidadão) das regras de negócio (triagem, SLA, roteamento), permitindo evoluir cada uma independentemente.
- **Escala horizontal previsível:** O front Next.js pode ser servido por um CDN/edge (Vercel/CloudFront) enquanto o backend escala em containers atrás de um load balancer — um pré-requisito para uma plataforma pública municipal.
- **Time-to-market:** Permitiu desenvolver o frontend completo contra mocks (`json-server` na porta 3001 + MSW) sem bloquear a equipe pela ausência do backend, mantendo contrato HTTP/REST estável.
- **Compatibilidade com o modelo físico relacional** (PostgreSQL, descrito em `4_MODELO_FISICO_DDL_SQL.md`): operações transacionais sobre chamados, SLAs e usuários se beneficiam do isolamento e ACID do banco — adequado para um servidor centralizado, não para P2P ou event-driven puro.

**Componentes distribuídos:**

| Componente | Processo | Porta | Responsabilidade |
|------------|----------|-------|------------------|
| Frontend Next.js | Node.js (App Router) | 3000 | UI, autenticação, renderização, API routes leves |
| Mock API (json-server) | Node.js | 3001 | CRUD de chamados, usuários, notificações em desenvolvimento |
| Backend (planejado) | Express 5 + Prisma 7 | 4000 | Regras de negócio, SLA, autenticação JWT, persistência |
| Banco de Dados | PostgreSQL | 5432 | Persistência relacional (DDL completo em `4_MODELO_FISICO_DDL_SQL.md`) |

**Onde está implementado no repositório:**

- Frontend: `frontend/` (Dockerfile, docker-compose.yml, Next.js standalone)
- Backend stub: `backend/` (Express 5 + Prisma 7 configurados em `backend/package.json`)
- Modelo de dados: `4_MODELO_FISICO_DDL_SQL.md`
- Análise BD relacional vs. NoSQL com justificativa: `1_ANALISE_BD_RELACIONAL_VS_NOSQL.md`

---

## 2. Desenho da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA CLIENTE                                 │
│                                                                             │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │ Cidadão        │    │ Gestor         │    │ Super Admin    │             │
│  │ (mobile/web)   │    │ (desktop/web)  │    │ (desktop/web)  │             │
│  └────────┬───────┘    └────────┬───────┘    └────────┬───────┘             │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │                     │                     │
            │           HTTPS / HTTP (REST + JSON)      │
            │                     │                     │
┌───────────▼─────────────────────▼─────────────────────▼─────────────────────┐
│                       CAMADA DE APRESENTAÇÃO                                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS 14 — App Router :3000                      │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │ React Server │  │ Client Comp. │  │ middleware.ts│                 │  │
│  │  │ Components   │  │ + Zustand    │  │ (route guard)│                 │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │  │
│  │  ┌──────────────────────────────────────────────────┐                 │  │
│  │  │ API Routes (/api/tickets, /api/auth, /api/users) │                 │  │
│  │  └──────────────────────────────────────────────────┘                 │  │
│  │  Tecnologias: TypeScript, Chakra UI, React Hook Form + Zod,           │  │
│  │              Leaflet/Leaflet.heat, Recharts, jspdf, xlsx              │  │
│  └────────────────────────────┬──────────────────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                  HTTP/REST (JSON, fetch API)
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                          CAMADA DE SERVIÇO                                  │
│                                                                             │
│  ┌─────────────────────────────────┐    ┌────────────────────────────────┐  │
│  │  json-server (mock dev) :3001   │    │  Express 5 + Prisma 7 :4000    │  │
│  │  - /usuarios                    │    │  (planejado)                   │  │
│  │  - /chamados                    │    │  - /auth (JWT)                 │  │
│  │  - /notificacoes                │    │  - /chamados (CRUD + SLA)      │  │
│  │  Protocolo: HTTP/REST           │    │  - /relatorios                 │  │
│  └─────────────────────────────────┘    │  Protocolo: HTTP/REST          │  │
│                                         └────────────┬───────────────────┘  │
└──────────────────────────────────────────────────────┼──────────────────────┘
                                                       │
                                              TCP/IP (driver Prisma)
                                                       │
┌──────────────────────────────────────────────────────▼──────────────────────┐
│                          CAMADA DE DADOS                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       PostgreSQL :5432                              │    │
│  │  Schemas: USUARIO, ORGAO, CHAMADO, TIMELINE_EVENTO,                 │    │
│  │           NOTIFICACAO, SLA, ADMIN, DASHBOARD_SLA, AUDITORIA_ADMIN   │    │
│  │  Índices em: protocolo, status, orgao_id, criado_em                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────┐
         │  SERVIÇOS EXTERNOS (planejados / futuros)        │
         │  - Leaflet Tile Server (HTTP)                    │
         │  - Firebase Cloud Messaging — push (HTTPS)       │
         │  - Geolocation API do navegador (Web API)        │
         └──────────────────────────────────────────────────┘
```

**Protocolos por interação:**

| Origem → Destino | Protocolo | Formato |
|------------------|-----------|---------|
| Cliente → Next.js | HTTPS | HTML/JS/CSS + JSON |
| Next.js (client) → API Routes | HTTP/REST | JSON |
| Next.js → json-server | HTTP/REST | JSON |
| Next.js / Express → PostgreSQL | TCP/IP (driver pg) | SQL |
| Cliente → Leaflet Tiles | HTTP | PNG (tiles) |
| Backend → FCM (push) | HTTPS | JSON |

---

## 3. Concorrência e Paralelismo

**Mecanismos utilizados:**

### 3.1 Event Loop assíncrono do Node.js (concorrência I/O-bound)

- **Onde:** todas as API Routes do Next.js (`frontend/src/app/api/**`) e o backend Express (`backend/src/server.ts`).
- **Como:** funções `async`/`await` permitem que múltiplas requisições HTTP sejam processadas em paralelo sem bloquear a thread principal — enquanto uma requisição aguarda I/O (DB, fetch), outras avançam.
- **Ganho:** atende dezenas de gestores e centenas de cidadãos simultâneos com baixo consumo de memória, sem necessidade de threads explícitas.

### 3.2 Fetch concorrente com fallback (resiliência)

- **Onde:** `frontend/src/stores/authStore.ts:34-57` e `frontend/src/stores/chamadosStore.ts:31-58`.
- **Como:** o cliente dispara um `fetch` para o `json-server` (`:3001`) e, caso falhe, executa o fallback síncrono sobre dados mock locais via `try/catch` aninhado — duas estratégias coordenadas dentro de uma única corrotina.
- **Ganho:** sessão de testes não trava quando o mock server está fora do ar — requisito explícito do plano de testes ("ambiente local configurado; usar mockups quando o servidor estiver fora do ar").

### 3.3 React Concurrent Rendering + Suspense

- **Onde:** todo o App Router (`frontend/src/app/**/page.tsx`) usa React 18 com renderização concorrente.
- **Como:** o React pode interromper, pausar e retomar renderizações sem bloquear a UI. Componentes carregados via `dynamic()` (ex.: `Heatmap` em `gestor/dashboard/page.tsx:19-27` e `gestor/mapa/page.tsx:11-21`) suspendem a árvore sem congelar o restante da página.
- **Ganho:** o dashboard do Gestor (TC07) renderiza KPIs imediatamente enquanto o mapa Leaflet (pesado, ~200 KB) carrega em segundo plano, atendendo o requisito de SLA "renderização em ≤ 3 segundos".

### 3.4 Code-splitting paralelo do Next.js

- **Onde:** App Router gera chunks separados por rota (`/cidadao/*`, `/gestor/*`, `/admin/*`).
- **Como:** o navegador baixa em paralelo apenas o JS da rota acessada. O build do Next.js paraleliza compilação via workers internos.
- **Ganho:** Cidadão (mobile, 4G) não baixa o bundle do Admin (Recharts + jspdf + xlsx), reduzindo o First Contentful Paint.

### 3.5 Memoização cooperativa (`useMemo`)

- **Onde:** `frontend/src/app/gestor/dashboard/page.tsx:53-78`, `gestor/fila/page.tsx:77-100`, `gestor/mapa/page.tsx:38-53`, `admin/matriz/page.tsx:174-182`.
- **Como:** computações pesadas (filtragem de fila por status + prioridade + período + busca, cálculo de SLA por chamado, geração de dados do heatmap) só re-executam quando suas dependências mudam, deixando a thread livre para renderização.
- **Ganho:** scroll e digitação na busca permanecem fluidos mesmo com listas grandes.

---

## 4. Otimização

### 4.1 Otimizações já implementadas

| # | Otimização | Onde | Impacto esperado |
|---|------------|------|------------------|
| 1 | **Lazy loading de bibliotecas pesadas** | `dynamic(() => import('@/components/Heatmap'), { ssr: false })` em `gestor/dashboard/page.tsx:19-27` e `gestor/mapa/page.tsx:11-21` | Reduz o bundle inicial em ~200 KB; evita erro de SSR do Leaflet (que precisa de `window`). |
| 2 | **Memoização de cálculos derivados** | `useMemo` em fila, dashboard, mapa, matriz (ver §3.5) | Filtragem e ordenação não recalculam a cada keystroke; recálculo só quando deps mudam. |
| 3 | **Filtros computados no cliente** | `gestor/fila/page.tsx:83-100` | Evita round-trip ao servidor para cada combinação de filtro. |
| 4 | **Code splitting por rota** | Next.js App Router (configuração padrão) | Bundle do cidadão não carrega libs do gestor (Recharts, jspdf, xlsx, Leaflet). |
| 5 | **Validação no cliente com Zod** | `frontend/src/lib/validations.ts` + `useForm` em `LoginForm` | Erros mostrados sem ida ao servidor; reduz carga no backend. |
| 6 | **Índices no modelo físico** | `4_MODELO_FISICO_DDL_SQL.md` cria índices em `protocolo`, `status`, `orgao_id`, `criado_em` | Filtros da fila do gestor (TC08) respondem em O(log n) no banco. |
| 7 | **Containerização** | `frontend/Dockerfile` (multi-stage) + `frontend/docker-compose.yml` | Builds reprodutíveis, deploy horizontal trivial. |
| 8 | **Strict mode TypeScript** | `tsconfig.json` com `"strict": true` | Detecta bugs em tempo de compilação, evitando regressões. |
| 9 | **Fallback gracioso de API** | `authStore.ts` e `chamadosStore.ts` (try/catch com mock local) | Tempo de resposta percebido cai a zero quando o mock está indisponível. |
| 10 | **Build standalone do Next.js** | Dockerfile usa output standalone | Imagem final menor, cold start mais rápido. |

### 4.2 Otimizações recomendadas para o futuro

| # | Ponto | O que fazer | Justificativa / Ganho |
|---|-------|-------------|------------------------|
| 1 | **Debounce no campo de busca** | Aplicar `useDebounce` (150–300 ms) em `gestor/fila/page.tsx` e `cidadao/chamados/page.tsx` | Hoje a filtragem dispara a cada keystroke; com muitos chamados isso pode gerar jank. |
| 2 | **Paginação / virtualização da fila** | Usar `react-window` ou paginação server-side na `/gestor/fila` | Hoje carrega todos os chamados de uma vez; com 10k+ registros, DOM explode. |
| 3 | **Cache HTTP com SWR ou TanStack Query** | Substituir `fetch` cru nos stores Zustand por uma camada de cache | Evita refetch desnecessário ao trocar de tela; revalidação em background. |
| 4 | **Backend real com índices e cursors** | Implementar `backend/src/server.ts` (hoje 0 bytes) com Express + Prisma já configurados | Today o frontend depende de json-server (single-threaded, sem queries complexas). |
| 5 | **Cache de tiles do Leaflet** | Configurar service worker para cache offline dos tiles do mapa | Cidadão em área com sinal fraco ainda consegue marcar localização. |
| 6 | **Pré-compressão Brotli/Gzip** | Habilitar no Next.js config ou no proxy reverso | Reduz transferência de JS/CSS em 60–80%. |
| 7 | **Imagens otimizadas** | Migrar `<img>` para `next/image` (lazy + AVIF/WebP) | Fotos de chamados (US-005) pesam — `next/image` já entrega tamanhos responsivos. |
| 8 | **Unificação de fontes de dados mock** | Hoje cada tela tem seu próprio array hardcoded (fila, orgãos, matriz, usuários) | Reduz inconsistência entre telas e permite teste E2E real. |
| 9 | **Worker thread para geração de PDF/Excel** | Mover `exportarPDF`/`exportarExcel` (em `gestor/relatorios/page.tsx`) para um Web Worker | Hoje trava a UI ao exportar relatórios grandes; um worker paraleliza de verdade. |
| 10 | **Push notifications via FCM** | Integrar Firebase Cloud Messaging para atender US-008 | Hoje notificações são apenas in-app (banco mock); push real cumpriria o SLA de "≤ 5 min após mudança de status". |
| 11 | **Connection pooling no Prisma** | Configurar `pool_size` no Prisma quando o backend for ligado | Evita esgotamento de conexões PostgreSQL sob carga. |
| 12 | **Server Components para listas read-only** | Migrar `/cidadao/chamados` (listagem) para RSC | Reduz JS enviado ao cliente; renderização no servidor com streaming. |

---

## Mapeamento rápido (onde encontrar cada requisito)

| Requisito | Arquivo(s) principal(is) |
|-----------|--------------------------|
| Arquitetura distribuída | `frontend/`, `backend/`, `frontend/docker-compose.yml`, `1_ANALISE_BD_RELACIONAL_VS_NOSQL.md` |
| Diagrama de arquitetura | Este documento, seção 2 |
| Concorrência | `frontend/src/stores/*.ts`, `frontend/src/app/gestor/dashboard/page.tsx:19-27`, `frontend/src/app/gestor/mapa/page.tsx:11-21` |
| Memoização (otimização) | `frontend/src/app/gestor/{dashboard,fila,mapa}/page.tsx`, `admin/matriz/page.tsx` |
| Modelo de dados otimizado | `4_MODELO_FISICO_DDL_SQL.md` |
| Containerização | `frontend/Dockerfile`, `frontend/docker-compose.yml` |

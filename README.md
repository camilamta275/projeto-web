# Fiscalize - Sistema Integrado de Gestão Urbana de Pernambuco

## 🎯 Visão Geral

Fiscalize é um sistema web completo construído com as tecnologias mais modernas do mercado, permitindo que cidadãos reportem problemas urbanos, gestores acompanhem e resolvam demandas, e inspetores coordenem ações.

## 📚 Stack Tecnológico

- **Framework Web**: Next.js 14+ com App Router
- **Linguagem**: TypeScript (strict mode)
- **UI Components**: Chakra UI v2
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **Mock API**: MSW (Mock Service Worker)
- **Database**: Node.js API routes (pode ser integrado com PostgreSQL, MongoDB, etc)

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm, yarn, ou bun

### Passos

1. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
bun install
```

2. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

3. **Abra o navegador**
Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
projeto-web/
├── backend/                          # API Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma            # Modelo de dados (Prisma)
│   ├── src/
│   │   ├── controllers/             # Controladores HTTP
│   │   │   └── authController.ts
│   │   ├── middlewares/             # Middlewares Express
│   │   │   └── authMiddleware.ts
│   │   ├── routes/                  # Definição de rotas
│   │   │   └── authRoutes.ts
│   │   ├── services/                # Regras de negócio
│   │   │   └── authService.ts
│   │   └── server.ts                # Entry point do servidor
│   ├── .env.example
│   ├── COMO_RODAR_O_BACK.md
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
│
├── frontend/                         # Aplicação Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/                     # Rotas Next.js (App Router)
│   │   │   ├── admin/               # Painel administrativo
│   │   │   │   ├── competencias/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── matriz/
│   │   │   │   ├── orgaos/
│   │   │   │   └── usuarios/
│   │   │   ├── api/                 # API routes (Next.js)
│   │   │   │   ├── analytics/
│   │   │   │   ├── auth/
│   │   │   │   ├── notifications/
│   │   │   │   ├── tickets/
│   │   │   │   └── users/
│   │   │   ├── cidadao/             # Área do cidadão
│   │   │   │   ├── chamados/
│   │   │   │   └── notificacoes/
│   │   │   ├── dashboard/
│   │   │   ├── gestor/              # Área do gestor
│   │   │   │   ├── chamados/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── fila/
│   │   │   │   ├── mapa/
│   │   │   │   ├── perfil/
│   │   │   │   └── relatorios/
│   │   │   ├── login/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/              # Componentes React reutilizáveis
│   │   │   ├── chamados/            # Componentes de chamados
│   │   │   │   ├── ChamadoCard.tsx
│   │   │   │   ├── ChamadoCardV2.tsx
│   │   │   │   ├── FiltroBar.tsx
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── TicketTimeline.tsx
│   │   │   │   └── Timeline.tsx
│   │   │   ├── layout/              # Componentes de layout
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── CategoriaGrid.tsx
│   │   │   ├── ChamadoCard.tsx
│   │   │   ├── CreateTicketForm.tsx
│   │   │   ├── FilaChamadoRow.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HeaderCidadao.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Providers.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SLABar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   └── TimelineEvent.tsx
│   │   ├── hooks/                   # Hooks customizados
│   │   │   ├── useApi.ts
│   │   │   ├── useForm.ts
│   │   │   └── useMSW.ts
│   │   ├── lib/                     # Utilitários, tema e validações
│   │   │   ├── mock-data.ts
│   │   │   ├── theme.ts
│   │   │   └── validations.ts
│   │   ├── mocks/                   # MSW (Mock Service Worker)
│   │   │   ├── browser.ts
│   │   │   ├── db.json
│   │   │   ├── handlers.ts
│   │   │   └── server.ts
│   │   ├── stores/                  # Stores Zustand
│   │   │   ├── authStore.ts
│   │   │   ├── chamadosStore.ts
│   │   │   ├── gestorStore.ts
│   │   │   ├── managerProfileStore.ts
│   │   │   ├── notificacoesStore.ts
│   │   │   ├── notificationStore.ts
│   │   │   └── ticketStore.ts
│   │   ├── tests/                   # Testes (Jest + Testing Library)
│   │   │   ├── acceptance/
│   │   │   │   ├── cidadao-dashboard.test.tsx
│   │   │   │   ├── dashboard-page.test.tsx
│   │   │   │   ├── login-page.test.tsx
│   │   │   │   └── smoke.test.tsx
│   │   │   └── setup/
│   │   │       └── jestMocks.ts
│   │   ├── types/                   # Tipos TypeScript
│   │   │   ├── chamado.ts
│   │   │   ├── enums.ts
│   │   │   ├── index.ts
│   │   │   ├── leaflet-heat.d.ts
│   │   │   ├── notificacao.ts
│   │   │   ├── orgao.ts
│   │   │   ├── user.ts
│   │   │   └── usuario.ts
│   │   └── utils/                   # Funções utilitárias
│   │       ├── constants.ts
│   │       ├── dateFormatter.ts
│   │       └── masks.ts
│   ├── public/                      # Arquivos estáticos
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── jest.config.ts
│   ├── jest.setup.ts
│   ├── middleware.ts
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── cypress/                          # Testes E2E (Cypress)
│   ├── e2e/
│   │   ├── login.cy.js
│   │   └── open_chamado.cy.js
│   ├── fixtures/
│   │   └── example.json
│   ├── screenshots/
│   └── support/
│       ├── commands.ts
│       └── e2e.ts
│
├── 1_ANALISE_BD_RELACIONAL_VS_NOSQL.md
├── 2_MODELO_CONCEITUAL.md
├── 3_MODELO_LOGICO_ER_DIAGRAM.md
├── 4_MODELO_FISICO_DDL_SQL.md
├── ANALISE_PLANO_DE_TESTES.md
├── COMO_RODAR_TESTES_AUTOMATIZADOS.md
├── Requisitos Gerais do Projeto.md
├── RESPOSTAS_REQUISITOS_GERAIS.md
├── cypress.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

## 🔐 Autenticação

O sistema inclui um exemplo de autenticação com Zustand. As credenciais padrão para teste:

**Email**: cidadao@example.com  
**Senha**: qualquer uma (simulado)

### Roles de Usuário

- **CITIZEN**: Cidadão comum - pode criar tickets
- **INSPECTOR**: Inspetor - gerencia e inspeciona tickets
- **MANAGER**: Gerente - supervisiona e gera relatórios
- **ADMIN**: Administrador - acesso completo ao sistema

## 📝 Funcionalidades

### ✅ Implementadas
- [x] Autenticação com Zustand
- [x] Dashboard com KPIs
- [x] CRUD de Tickets
- [x] Sistema de Comentários
- [x] Filtros e busca de tickets
- [x] Componentes UI com Chakra
- [x] Validação de formulários com Zod
- [x] API routes Next.js
- [x] Tipos TypeScript completos

### 🔄 Em Desenvolvimento
- [ ] Mapa interativo com geolocalização
- [ ] Notificações em tempo real
- [ ] Relatórios avançados com gráficos
- [ ] Integração com banco de dados real
- [ ] Sistema de permissões granulares
- [ ] Upload de imagens
- [ ] Análises e dashboards avançados

````md

## 📊 Validações Zod Disponíveis

- `loginSchema`: Validação de login
- `registerSchema`: Validação de cadastro
- `createTicketSchema`: Validação de novo ticket
- `updateTicketSchema`: Validação de atualização
- `commentSchema`: Validação de comentários
- `editProfileSchema`: Validação de perfil

## 🎨 Tema e Customização

### Cores Primárias
- Primary: Blue (`#0ea5e9`)
- Secondary: Purple (`#a78bfa`)
- Success: Green (`#22c55e`)
- Warning: Yellow (`#eab308`)
- Danger: Red (`#ef4444`)

### Customizar Tema
Edite `tailwind.config.ts` e configure as cores no arquivo de tema do Chakra UI.

## 🔌 Integração com Backend

Para integrar com um backend real:

1. Substitua os endpoints em `src/app/api/` com chamadas reais
2. Configure variáveis de ambiente em `.env.local`
3. Use o hook `useApi` para chamadas HTTP

## 📦 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Fiscalize
NEXT_PUBLIC_APP_DESCRIPTION=Sistema integrado de gestão urbana de Pernambuco
```

## 🛠️ Build para Produção

```bash
npm run build
npm run start
```

## 📄 Licença

MIT

## 👨‍💻 Desenvolvedor

Desenvolvido como um sistema completo de gestão urbana para Pernambuco.

---
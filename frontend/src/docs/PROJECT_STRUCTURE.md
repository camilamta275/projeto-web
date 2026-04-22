# Estrutura do Projeto Fiscalize

```
fiscalize/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD com GitHub Actions
├── .vscode/
│   ├── extensions.json         # Extensões recomendadas
│   └── settings.json           # Configurações do editor
├── public/
│   └── robots.txt              # SEO
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   ├── tickets/
│   │   │   ├── users/
│   │   │   ├── notifications/
│   │   │   └── analytics/
│   │   ├── dashboard/
│   │   ├── tickets/            # [id]/ page + create/
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   ├── admin/
│   │   ├── management/
│   │   ├── reports/
│   │   ├── globals.css         # Estilos globais
│   │   └── layout.tsx          # Layout raiz
│   ├── components/             # Componentes React
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainLayout.tsx
│   │   ├── LoginForm.tsx
│   │   ├── CreateTicketForm.tsx
│   │   ├── TicketCard.tsx
│   │   ├── KPICard.tsx
│   │   ├── Providers.tsx
│   │   └── index.ts
│   ├── hooks/                  # Hooks customizados
│   │   ├── useApi.ts
│   │   ├── useForm.ts
│   │   ├── useMSW.ts
│   │   └── index.ts
│   ├── stores/                 # Zustand State Stores
│   │   ├── authStore.ts
│   │   ├── ticketStore.ts
│   │   └── notificationStore.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── lib/                    # Bibliotecas e utilitários
│   │   ├── validations.ts      # Schemas Zod
│   │   └── theme.ts            # Tema Chakra UI
│   ├── utils/                  # Funções utilitárias
│   │   ├── constants.ts
│   │   └── dateFormatter.ts
│   └── mocks/                  # Mock API com MSW
│       ├── handlers.ts
│       ├── server.ts
│       └── browser.ts
├── .env.example                # Variáveis de ambiente exemplo
├── .env.local                  # Variáveis locais (gitignored)
├── .eslintrc.json             # Configuração ESLint
├── .prettierrc                 # Configuração Prettier
├── .gitignore                  # Git ignore
├── .dockerignore               # Docker ignore
├── docker-compose.yml          # Docker Compose para dev
├── Dockerfile                  # Dockerfile para produção
├── next.config.js              # Configuração Next.js
├── tsconfig.json               # Configuração TypeScript
├── tsconfig.node.json          # TypeScript para build tools
├── tailwind.config.ts          # Configuração Tailwind
├── postcss.config.js           # Configuração PostCSS
├── package.json                # Dependências e scripts
├── README.md                   # Documentação principal
├── DEVELOPMENT.md              # Guia de desenvolvimento
├── CONTRIBUTING.md             # Guia de contribuição
└── LICENSE                     # Licença do projeto
```

## 📂 Descrição das Pastas

### `/src/app`
Contém as páginas e rotas do Next.js. Cada arquivo `page.tsx` é uma rota.
- API routes em `/api/`
- Páginas públicas e autenticadas
- Layouts compartilhados

### `/src/components`
Componentes React reutilizáveis com Chakra UI:
- `Header.tsx` - Barra superior com navegação
- `Sidebar.tsx` - Menu lateral responsivo
- `MainLayout.tsx` - Layout principal
- `LoginForm.tsx` - Formulário de login
- `TicketCard.tsx` - Card individual de ticket
- `CreateTicketForm.tsx` - Formulário para criar ticket
- `KPICard.tsx` - Card de métricas
- `Providers.tsx` - Providers do Chakra UI

### `/src/hooks`
Hooks customizados do React:
- `useApi.ts` - Para chamadas HTTP
- `useForm.ts` - Integração React Hook Form + Zod
- `useMSW.ts` - Inicializar MSW

### `/src/stores`
State management com Zustand:
- `authStore.ts` - Autenticação e usuário
- `ticketStore.ts` - Gerenciamento de tickets
- `notificationStore.ts` - Notificações

### `/src/types`
Definições de tipos TypeScript compartilhadas:
- Enums (UserRole, TicketStatus, etc)
- Interfaces (User, Ticket, etc)

### `/src/lib`
Utilitários compartilhados:
- `validations.ts` - Schemas Zod para formulários
- `theme.ts` - Customização do tema Chakra UI

### `/src/utils`
Funções utilitárias:
- `constants.ts` - Constantes da aplicação
- `dateFormatter.ts` - Formatação de datas

### `/src/mocks`
Mock API com MSW:
- `handlers.ts` - Definição dos handlers da API
- `server.ts` - Setup para Node.js
- `browser.ts` - Setup para browser

## 🔄 Fluxo de Dados

```
User Input
    ↓
Component (TicketCard, LoginForm, etc)
    ↓
Hook (useForm, useApi)
    ↓
Zustand Store (ticketStore, authStore)
    ↓
API Route (/api/tickets)
    ↓
Mock API / Real Backend
```

## 🚀 Próximos Passos

1. Instalar dependências: `npm install`
2. Configurar `.env.local`
3. Iniciar dev: `npm run dev`
4. Abrir http://localhost:3000
5. Começar a desenvolver!

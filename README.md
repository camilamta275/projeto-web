# Fiscalize - Sistema Integrado de Gestão Urbana de Pernambuco

**Recife Inteligente** é uma plataforma moderna para conectar cidadãos, gestores e inspetores em um sistema integrado de denúncias e gerenciamento de problemas urbanos.

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
src/
├── app/                    # Páginas e rotas do Next.js (App Router)
│   ├── api/               # Rotas da API
│   ├── dashboard/         # Página de dashboard
│   ├── tickets/           # Gerenciamento de tickets
│   ├── login/             # Página de login
│   ├── profile/           # Perfil do usuário
│   ├── admin/             # Painel administrativo
│   ├── management/        # Painel de gerenciamento
│   └── reports/           # Relatórios e análises
├── components/            # Componentes React reutilizáveis
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── LoginForm.tsx
│   ├── TicketCard.tsx
│   ├── KPICard.tsx
│   └── Providers.tsx
├── stores/                # Stores Zustand para state management
│   ├── authStore.ts
│   ├── ticketStore.ts
│   └── notificationStore.ts
├── hooks/                 # Hooks customizados
│   ├── useApi.ts
│   ├── useForm.ts
│   └── index.ts
├── types/                 # Definições de tipos TypeScript
│   └── index.ts
├── lib/                   # Utilitários e validações
│   └── validations.ts
├── utils/                 # Funções utilitárias
│   ├── constants.ts
│   └── dateFormatter.ts
└── mocks/                 # Mocks com MSW
    ├── handlers.ts
    └── server.ts
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

## 🧪 Testes

Para executar testes:
```bash
npm run test
```

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

**Fiscalize - Tornando Recife mais inteligente e responsiva!** 🚀

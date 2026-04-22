# Connect City - Plataforma Participativa de Gestão de Demandas Urbanas

## 📋 Descrição

Connect City é uma plataforma web inovadora para participação cidadã na gestão urbana de Recife. Permite que cidadãos reportem problemas urbanos (buraco em rua, vazamento de água, sinalização, etc.) e que gestores públicos gerenciem e resolvam esses chamados de forma eficiente.

**Demo ao vivo**: [Connect City Demo](https://connect-city-demo.vercel.app)

---

## 🎯 Funcionalidades Principais

### 👤 Para Cidadãos
- **Dashboard de Chamados**: Visualizar todos os chamados enviados com status, prioridade e SLA
- **Wizard de Novo Chamado**: Criar novo chamado em 3 passos simples (categoria, foto, confirmação)
- **Acompanhamento em Tempo Real**: Timeline completa do chamado com eventos e atualizações
- **Centro de Notificações**: Receber notificações de atualizações dos seus chamados
- **Busca e Filtros**: Encontrar chamados por status, data, localização

### 🏢 Para Gestores
- **Dashboard Operacional**: Métricas de SLA, chamados abertos, alertas críticos
- **Fila de Atendimento**: Visualizar e gerenciar queue de chamados com checkboxes para bulk actions
- **Detalhe do Chamado**: Informações completas, timeline, ações (aceitar, encaminhar, designar, pausar, concluir)
- **Análise de Performance**: Gráficos de categorias, calor de SLA vencido

### ⚙️ Para Administradores
- **Matriz de Competências**: CRUD de regras de roteamento por categoria/órgão/SLA/prioridade
- **Gestão de Órgãos**: Cadastro e administração de órgãos públicos e concessionárias
- **Gestão de Usuários**: Criação, edição e desativação de usuários com geração de senha temporária
- **Painel de Controle**: Status do sistema, versão, última sincronização

---

## 🛠️ Stack Técnico

**Frontend**:
- Next.js 14.2.3 (App Router)
- React 18.3.1 (TypeScript)
- Chakra UI 2.8.2 (Component library)
- TailwindCSS 3.3.6 (Utility styles)
- Zustand 4.4.1 (State management)
- Recharts 2.10.3 (Data visualization)
- React Hook Form + Zod (Form validation)

**Backend Mock**:
- JSON Server 0.17.4 (Mock API on port 3001)
- Axios 1.6.2 (HTTP client)

**DevTools**:
- Vite (Build tool)
- Vitest (Unit testing)
- ESLint + Prettier (Code quality)
- Bun (Package manager)
- Concurrently (Parallel scripts)

**Database**: JSON Server (development) → PostgreSQL (production)

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ ou Bun 1.0+
- npm/yarn/bun instalado

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/connect-city.git
cd connect-city
```

### 2. Instalar dependências
```bash
npm install
# ou com Bun
bun install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```

Conteúdo do `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=seu_token_mapbox_aqui
```

### 4. Iniciar servidor de desenvolvimento com mock backend

**Opção 1**: Executar em 2 terminais
```bash
# Terminal 1 - Frontend (porta 3000)
npm run dev

# Terminal 2 - Mock backend (porta 3001)
npm run mock
```

**Opção 2**: Executar ambos em paralelo
```bash
npm run dev-with-mock
```

### 5. Acessar a aplicação
```
http://localhost:3000
```

---

## 📱 Credenciais de Demo

### Cidadão
- **CPF**: 123.456.789-00
- **Nome**: João Silva
- Acesso: Visualizar chamados, criar novo, acompanhar timeline

### Gestor (Prefeitura)
- **CPF**: 345.678.901-22
- **Nome**: Pedro Costa
- **Órgão**: Prefeitura Municipal do Recife (PMR)
- Acesso: Dashboard, fila de chamados, detalhe com ações

### Gestor (COMPESA - Água)
- **CPF**: 567.890.123-44
- **Nome**: Carlos Ferreira
- **Órgão**: COMPESA
- Acesso: Dashboard e fila de chamados de água

### Administrador
- **CPF**: 678.901.234-55
- **Nome**: Admin Sistema
- Acesso: Matriz de competências, órgãos, usuários, sistema

---

## 📁 Estrutura do Projeto

```
remix-of-connect-city-main/
├── src/
│   ├── app/                          # Next.js 14 app router
│   │   ├── (auth)/login/             # Página de login (C2)
│   │   ├── (cidadao)/
│   │   │   ├── chamados/             # Dashboard cidadão (C3)
│   │   │   ├── chamados/novo/        # Wizard 3 passos (C4-C6)
│   │   │   ├── chamados/[id]/        # Detalhe com timeline (C7)
│   │   │   └── notificacoes/         # Centro notificações (C8)
│   │   ├── (gestor)/
│   │   │   ├── dashboard/            # Dashboard gestor (G2)
│   │   │   ├── fila/                 # Fila atendimento (G3)
│   │   │   └── chamados/[id]/        # Detalhe gestor (G4)
│   │   └── (admin)/
│   │       ├── page.tsx              # Dashboard admin (A1)
│   │       ├── matriz/               # Matriz competências (A3)
│   │       ├── orgaos/               # Gestão órgãos (A2)
│   │       └── usuarios/             # Gestão usuários (A4)
│   ├── components/
│   │   ├── StatusBadge.tsx           # Status badge reutilizável
│   │   ├── PriorityBadge.tsx         # Prioridade badge
│   │   ├── SLABar.tsx                # Barra de progresso SLA
│   │   ├── ChamadoCard.tsx           # Card do chamado
│   │   ├── FilaChamadoRow.tsx        # Linha da tabela de fila
│   │   ├── TimelineEvent.tsx         # Evento da timeline
│   │   ├── KPICard.tsx               # Card de métrica KPI
│   │   ├── CategoriaGrid.tsx         # Grid de categorias
│   │   ├── ProtectedRoute.tsx        # HOC de autenticação
│   │   └── ui/                       # Componentes shadcn/ui
│   ├── stores/
│   │   ├── authStore.ts              # Zustand - autenticação
│   │   ├── chamadosStore.ts          # Zustand - chamados
│   │   ├── gestorStore.ts            # Zustand - métricas gestor
│   │   └── notificacoesStore.ts      # Zustand - notificações
│   ├── types/
│   │   ├── chamado.ts                # Interface Chamado
│   │   ├── usuario.ts                # Interface Usuario
│   │   └── orgao.ts                  # Interface Orgao
│   ├── utils/
│   │   ├── masks.ts                  # CPF masking/validation
│   │   └── utils.ts                  # Helper functions
│   ├── mocks/
│   │   └── db.json                   # Mock data para JSON Server
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                           # Assets estáticos
├── middleware.ts                     # Next.js middleware
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md (este arquivo)
```

---

## 🔄 Fluxo de Dados

```
Frontend (React/Zustand)
    ↓
Axios HTTP Client
    ↓
JSON Server (localhost:3001)
    ↓
db.json (Mock data)
```

Em produção:
- Substituir JSON Server por API backend real (Node.js, FastAPI, etc.)
- Usar autenticação JWT com HttpOnly cookies
- Adicionar validação de regras de negócio no backend

---

## 🧪 Testes

```bash
# Rodar testes unitários
npm run test

# Rodar com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🌐 Deployment

### Vercel (Recomendado para Next.js)

```bash
# 1. Fazer push para GitHub
git push origin main

# 2. Conectar repo no Vercel (https://vercel.com)
# 3. Selecionar "Next.js" framework
# 4. Adicionar variáveis de ambiente (.env.local)
# 5. Deploy automático
```

### Docker

```bash
# Build image
docker build -t connect-city .

# Rodar container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api.seu-dominio.com connect-city
```

---

## 📊 Dados de Exemplo

O arquivo `src/mocks/db.json` contém:

- **6 Usuários**: 2 cidadãos, 3 gestores, 1 admin
- **5 Órgãos**: PMR, GOPE, COMPESA, Energisa, DETRAN-PE
- **6 Chamados**: Com timelines e status variados
- **10 Regras de Competência**: Mapeamento categoria → órgão → SLA

Locais mencionados (Recife):
- Avenida Boa Viagem
- Rua da Aurora
- Rua Imperial
- Praça do Derby
- Avenida Visconde de Albuquerque
- Avenida Getúlio Vargas

---

## 🔐 Segurança

### Implementado
- CPF masking (apenas no frontend)
- Validação de entrada com Zod
- CORS headers configurados

### TODO (Produção)
- JWT authentication com HttpOnly cookies
- HTTPS obrigatório
- Rate limiting
- SQL injection prevention (ORM/prepared statements)
- CSRF protection
- Encriptação de dados sensíveis
- Audit logging

---

## 📈 Performance

- **Lazy loading**: Componentes dinâmicos com `next/dynamic`
- **Image optimization**: Next.js Image component
- **Code splitting**: Rotas separadas com bundles independentes
- **Caching**: SWR para requisições HTTP

---

## 🐛 Troubleshooting

### Erro: "Failed to connect to API"
```bash
# Verificar se JSON Server está rodando na porta 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Reiniciar JSON Server
npm run mock
```

### Erro: "Module not found"
```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm install
```

### Erro de CPF inválido no login
- Use um dos CPFs de demo (veja credenciais)
- Ou ajuste `src/utils/masks.ts` para desabilitar validação

---

## 📚 Documentação Adicional

- [SETUP.md](./SETUP.md) - Instruções detalhadas de setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura do projeto

---

## 🤝 Contribuindo

1. Fork o projeto
2. Criar branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 📞 Suporte

Para reportar bugs ou sugerir features:
- GitHub Issues: [https://github.com/seu-usuario/connect-city/issues](https://github.com/seu-usuario/connect-city/issues)
- Email: contato@connectcity.com.br

---

## 🙋 Autores

- **Seu Nome** - Desenvolvimento inicial
- Comunidade - Contribuições e feedback

---

## 🎉 Agradecimentos

- Prefeitura do Recife pela inspiração
- Comunidade open source por ferramentas incríveis

---

**Última atualização**: Abril 2026  
**Versão**: 1.0.0-beta

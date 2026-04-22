# Smart City Help Desk - Recife

Sistema web de gerenciamento de chamados urbanos para a Prefeitura do Recife, com suporte para três perfis de usuário: Cidadão, Gestor e Admin.

## 📋 Stack Tecnológico

- **Next.js 14+** - Framework React com App Router
- **TypeScript (Strict)** - Tipagem estática completa
- **Chakra UI 2** - Componentes visuais acessíveis
- **Tailwind CSS** - Utilidades de styling
- **Zustand** - Gerenciamento de estado global
- **React Hook Form + Zod** - Validação de formulários
- **Axios** - Cliente HTTP
- **JSON Server** - API mock para desenvolvimento

## 🏗️ Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/            # Rotas de autenticação
│   │   └── login/
│   ├── (cidadao)/         # Rotas para cidadãos
│   │   ├── chamados/
│   │   ├── notificacoes/
│   │   └── perfil/
│   ├── (gestor)/          # Rotas para gestores
│   │   ├── dashboard/
│   │   ├── fila/
│   │   ├── mapa/
│   │   └── relatorios/
│   ├── (admin)/           # Rotas para administradores
│   │   ├── dashboard/
│   │   ├── orgaos/
│   │   ├── competencias/
│   │   └── usuarios/
│   └── page.tsx           # Página inicial (redireciona)
├── components/
│   ├── layout/            # Componentes de layout
│   ├── chamados/          # Componentes específicos
│   ├── gestor/
│   ├── admin/
│   └── ui/                # Componentes shadcn/ui
├── services/              # Camada de API
│   ├── api.ts             # Configuração axios
│   ├── chamados.ts
│   ├── usuarios.ts
│   └── orgaos.ts
├── stores/                # Zustand stores
│   ├── authStore.ts
│   ├── chamadosStore.ts
│   ├── gestorStore.ts
│   └── notificacoesStore.ts
├── types/                 # TypeScript types
│   ├── chamado.ts
│   ├── usuario.ts
│   ├── orgao.ts
│   └── index.ts
├── mocks/
│   └── db.json            # Dados mock JSON Server
└── lib/
    └── utils.ts           # Utilitários gerais
```

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
# ou
yarn install
# ou
bun install
```

### 2. Instalar JSON Server

```bash
npm install -D json-server concurrently
```

### 3. Atualizar Scripts no package.json

Adicione ou atualize os scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "mock": "json-server --watch src/mocks/db.json --port 3001",
    "dev-with-mock": "concurrently \"npm run dev\" \"npm run mock\"",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  }
}
```

### 4. Executar em Desenvolvimento

```bash
# Opção 1: Executar Next.js e JSON Server em paralelo
npm run dev-with-mock

# Opção 2: Executar separadamente em dois terminais
# Terminal 1: Next.js
npm run dev

# Terminal 2: JSON Server
npm run mock
```

### 5. Acessar a Aplicação

- **Aplicação**: http://localhost:3000
- **API JSON Server**: http://localhost:3001

## 👤 Contas de Demonstração

### Cidadão
- **Email**: `joao@example.com` ou `maria@example.com`
- **Acesso**: Criar, visualizar e acompanhar chamados

### Gestor
- **Email**: `pedro@pmr.pe.gov.br` (PMR)
- **Email**: `ana@pmr.pe.gov.br` (GOPE)
- **Email**: `carlos@compesa.pe.gov.br` (COMPESA)
- **Acesso**: Dashboard, fila, mapa e relatórios

### Admin
- **Email**: `admin@recife.pe.gov.br`
- **Acesso**: Gerenciamento completo do sistema

## 📊 Dados Mock

O arquivo `src/mocks/db.json` contém:

- **6 Usuários**: Distribuídos entre 3 perfis
- **5 Órgãos**: PMR, GOPE, COMPESA, Energisa, DETRAN-PE
- **6 Chamados**: Exemplos com diferentes statuses e prioridades
- **3 Notificações**: Exemplos para teste
- **10 Regras de Competência**: Associação de categorias com órgãos

## 🔑 Funcionalidades Principais

### Cidadão
- ✅ Criar novo chamado (wizard 3 passos)
- ✅ Listar seus chamados com filtros
- ✅ Ver detalhes do chamado com timeline
- ✅ Receber notificações
- ✅ Editar perfil

### Gestor
- ✅ Dashboard com KPIs
- ✅ Fila de chamados aguardando
- ✅ Mapa de chamados por localização
- ✅ Relatórios e análises
- ✅ Atribuir e transferir chamados
- ✅ Editar perfil

### Admin
- ✅ Dashboard administrativo
- ✅ Gerenciar órgãos
- ✅ Definir matriz de competências
- ✅ Gerenciar usuários
- ✅ Visualizar alertas do sistema

## 🛠️ Configuração de Ambiente

Crie um arquivo `.env.local` (opcional):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Tipos de Dados

### Chamado
- `protocolo`: SCH-2026-XXXX
- `status`: Aberto | Em Análise | Em Andamento | Aguardando | Resolvido | Fechado
- `prioridade`: Baixa | Média | Alta | Crítica
- `categoria`: Problemas na Via | Água e Esgoto | Iluminação Pública | etc.
- `slaHoras`: Tempo limite para resolução
- `timeline`: Array de eventos com audit trail

### Usuário
- `perfil`: Cidadão | Gestor | Admin
- `orgaoId`: ID do órgão (apenas para gestores)
- `status`: Ativo | Inativo | Suspenso

### Órgão
- 5 órgãos reais de Recife
- SLA configurável por órgão
- Categorias de chamados associadas

## 🔗 Endpoints da API

Base: `http://localhost:3001`

### Chamados
- `GET /chamados` - Listar todos
- `GET /chamados/:id` - Detalhe
- `POST /chamados` - Criar
- `PATCH /chamados/:id` - Atualizar
- `DELETE /chamados/:id` - Deletar

### Usuários
- `GET /usuarios` - Listar todos
- `GET /usuarios?email=X` - Buscar por email
- `POST /usuarios` - Criar
- `PATCH /usuarios/:id` - Atualizar
- `DELETE /usuarios/:id` - Deletar

### Órgãos
- `GET /orgaos` - Listar todos
- `GET /orgaos/:id` - Detalhe
- `POST /orgaos` - Criar
- `PATCH /orgaos/:id` - Atualizar

### Competências
- `GET /regrasCompetencia` - Listar todas
- `GET /regrasCompetencia?categoria=X` - Filtrar por categoria

### Notificações
- `GET /notificacoes` - Listar todas
- `PATCH /notificacoes/:id` - Marcar como lida

## 🎨 Componentes Principais

### Layout
- `Header` - Cabeçalho mobile com menu
- `Sidebar` - Menu lateral desktop
- `BottomNav` - Navegação mobile

### Chamados
- `ChamadoCard` - Card exibindo chamado
- `StatusBadge` - Badge com status colorido
- `Timeline` - Histórico de eventos
- `FiltroBar` - Filtros de busca

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Commit suas mudanças
3. Push para a branch
4. Abra um Pull Request

## 📄 Licença

Projeto para Prefeitura Municipal do Recife - 2026

## 📞 Suporte

Para dúvidas ou issues, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para uma Recife mais inteligente**

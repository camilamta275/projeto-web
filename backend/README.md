# Backend - Fiscalize

## 📋 Visão Geral

Backend da aplicação Fiscalize desenvolvido com **Express.js**, **TypeScript**, **Prisma ORM** e **PostgreSQL**.

---

## 🔐 Sistema de Perfis e Autorização

### Hierarquia de Perfis

O sistema implementa uma **hierarquia de permissões** onde perfis superiores têm acesso automático a recursos de perfis inferiores:

```
Admin (Super Administrador)
  ├─ Acesso a TODAS as rotas de Gestor
  ├─ Acesso a TODAS as rotas de Cidadão
  └─ Acesso a rotas exclusivas de Admin

Gestor (Gerenciador de Chamados)
  ├─ Acesso a rotas de Gestor
  ├─ Acesso a rotas de Cidadão
  └─ ❌ SEM acesso a rotas exclusivas de Admin

Cidadão (Usuário Comum)
  ├─ Acesso a rotas de Cidadão
  └─ ❌ SEM acesso a rotas de Gestor ou Admin
```

### Descrição dos Perfis

| Perfil | Responsabilidade | Exemplo de Acesso |
|--------|-----------------|------------------|
| **Admin** | Gerenciar sistema, usuários, relatórios globais | `/admin/users`, `/admin/reports` |
| **Gestor** | Gerenciar chamados atribuídos, unidades, equipes | `/gestor/chamados`, `/gestor/dashboard` |
| **Cidadão** | Criar e acompanhar seus próprios chamados | `/cidadao/chamados`, `/auth/me` |

---

## 🚀 Autenticação

### Endpoints de Autenticação

#### POST `/auth/register`
Registrar novo usuário (público)

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "SenhaForte@123",
  "perfil": "Cidadão"
}
```

**Respostas:**
- `201 Created` - Usuário criado com sucesso
- `400 Bad Request` - Dados inválidos
- `409 Conflict` - Email já cadastrado

---

#### POST `/auth/login`
Fazer login (público)

**Body:**
```json
{
  "email": "joao@example.com",
  "senha": "SenhaForte@123"
}
```

**Respostas:**
- `200 OK` - Login bem-sucedido, cookie HTTP-only retornado
- `401 Unauthorized` - Credenciais inválidas
- `500 Internal Server Error` - Erro do servidor

---

#### POST `/auth/logout`
Fazer logout (requer autenticação)

**Headers:**
```
Authorization: Bearer <token> (ou Cookie: token=<token>)
```

**Respostas:**
- `200 OK` - Logout bem-sucedido
- `401 Unauthorized` - Não autenticado

---

#### GET `/auth/me`
Obter dados do usuário autenticado (requer autenticação)

**Respostas:**
- `200 OK` - Dados do usuário
- `401 Unauthorized` - Não autenticado
- `404 Not Found` - Usuário não encontrado

---

## 👨‍💼 Rotas de Gestor

> ⚠️ **REQUER**: Autenticação + Perfil `Gestor` ou `Admin`

### GET `/gestor/dashboard`
Obter estatísticas do dashboard do gestor

**Resposta:**
```json
{
  "gestor": {
    "id": "uuid",
    "nome": "Nome do Gestor",
    "email": "gestor@example.com",
    "nomeUnidade": "Nome da Unidade",
    "slaCompliance": 95.5
  },
  "chamados": {
    "total": 50,
    "abertos": 10,
    "emProgresso": 15,
    "encerrados": 25
  }
}
```

---

### GET `/gestor/chamados`
Listar chamados do gestor

**Query Parameters:**
- `status`: Filtrar por status (ex: `Aberto`, `Em Progresso`, `Encerrado`)
- `limit`: Número de resultados (padrão: 10)
- `offset`: Número de registros a pular (padrão: 0)

**Resposta:**
```json
{
  "chamados": [
    {
      "id": "uuid",
      "protocolo": "PROT-001",
      "descricao": "Descrição do chamado",
      "status": "Aberto",
      "prioridade": "Alta",
      "criadoem": "2026-06-03T12:00:00Z",
      "cidadao": {
        "usuario": {
          "nome": "Cidadão",
          "email": "cidadao@example.com"
        }
      }
    }
  ],
  "pagina": {
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

---

### GET `/gestor/chamados/:id`
Obter detalhes de um chamado específico

**Parâmetros:**
- `id`: UUID do chamado

**Resposta:**
```json
{
  "chamado": {
    "id": "uuid",
    "protocolo": "PROT-001",
    "descricao": "Descrição detalhada",
    "status": "Aberto",
    "prioridade": "Alta",
    "endereco": "Rua X, 123",
    "latitude": "-15.789",
    "longitude": "-47.879",
    "criadoem": "2026-06-03T12:00:00Z",
    "cidadao": { ... },
    "categoria": { ... },
    "gestor": { ... }
  }
}
```

---

### PUT `/gestor/chamados/:id/status`
Atualizar status de um chamado

**Body:**
```json
{
  "status": "Em Progresso"
}
```

**Status Válidos:**
- `Aberto`
- `Em Progresso`
- `Encerrado`

**Respostas:**
- `200 OK` - Status atualizado
- `400 Bad Request` - Status inválido
- `404 Not Found` - Chamado não encontrado

---

## 🛡️ Tratamento de Erros

Todos os erros retornam um objeto padronizado:

```json
{
  "error": "Mensagem de erro",
  "statusCode": 400,
  "timestamp": "2026-06-03T12:00:00.000Z"
}
```

### Códigos de Status Comuns

| Status | Significado |
|--------|-----------|
| `400` | Requisição inválida (validação, dados faltando) |
| `401` | Não autenticado ou token expirado |
| `403` | Autenticado mas sem permissão |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: email duplicado) |
| `500` | Erro interno do servidor |

---

## 🗃️ Banco de Dados

### Modelo de Dados

**Tabela `usuario`:**
- `id` (UUID, PK)
- `nome` (String)
- `email` (String, UNIQUE)
- `senha` (String, hash bcrypt)
- `perfil` (Enum: Cidadão, Gestor, Admin)
- `status` (Enum: Ativo, Inativo)
- `criadoem` (Timestamp)

**Tabela `admin`:**
- `id` (UUID, FK → usuario.id)
- `nivel_acesso` (String)
- `permissao_escopo` (String)
- `ativo` (Boolean)

**Tabela `gestor`:**
- `usuarioid` (UUID, FK → usuario.id)
- `nomeunidade` (String)
- `slacompliancepct` (Decimal)

**Tabela `cidadao`:**
- `usuarioid` (UUID, FK → usuario.id)
- Outros campos específicos

---

## 🌱 Seed (Dados Iniciais)

### Criar usuário Admin na primeira execução

O seed cria automaticamente um usuário admin inicial. Configure via variáveis de ambiente:

```bash
npm run seed
```

**Variáveis de Ambiente (`.env`):**
```env
SEED_ADMIN_EMAIL="admin@fiscalize.gov.br"
SEED_ADMIN_PASSWORD="Admin@123456"
SEED_ADMIN_NAME="Administrador"
```

---

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm 8+

### Passos

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar ambiente:**
```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. **Gerar cliente Prisma:**
```bash
npm run prisma:generate
```

4. **Executar migrações:**
```bash
npm run prisma:migrate
```

5. **Executar seed (opcional):**
```bash
npm run seed
```

6. **Iniciar servidor:**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor em desenvolvimento |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run start` | Executa versão compilada |
| `npm run test` | Executa testes com Jest |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run prisma:generate` | Gera cliente Prisma |
| `npm run prisma:migrate` | Executa migrações do banco |
| `npm run seed` | Executa seed com dados iniciais |

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão PostgreSQL | - |
| `JWT_SECRET` | Chave secreta para tokens JWT | - |
| `JWT_EXPIRATION` | Tempo de expiração do token | `24h` |
| `PORT` | Porta do servidor | `3000` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:3001` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `SEED_ADMIN_EMAIL` | Email do admin inicial | `admin@fiscalize.gov.br` |
| `SEED_ADMIN_PASSWORD` | Senha do admin inicial | `Admin@123456` |
| `SEED_ADMIN_NAME` | Nome do admin inicial | `Administrador` |

---

## 🧪 Testando com cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fiscalize.gov.br",
    "senha": "Admin@123456"
  }' \
  -c cookies.txt
```

### Acessar dashboard de gestor (com Admin)
```bash
curl -X GET http://localhost:3000/gestor/dashboard \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Listar chamados
```bash
curl -X GET "http://localhost:3000/gestor/chamados?limit=10&offset=0" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 📚 Documentação Adicional

- [Modelo Conceitual](../2_MODELO_CONCEITUAL.md)
- [Modelo Lógico ER Diagram](../3_MODELO_LOGICO_ER_DIAGRAM.md)
- [DDL SQL](../4_MODELO_FISICO_DDL_SQL.md)
- [Setup Guide](./SETUP.md)
- [Como Rodar o Backend](./COMO_RODAR_O_BACK.md)

---

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
2. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
3. Push para a branch (`git push origin feature/MinhaFeature`)
4. Abra um Pull Request

---

## 📄 Licença

ISC

# 🚀 Guia de Setup - Backend

Instruções completas para configurar o ambiente de desenvolvimento do backend em uma nova máquina.

## 📋 Pré-requisitos

### Obrigatórios
- **Node.js 18+** - [Baixar aqui](https://nodejs.org/)
- **npm 8+** - Vem com Node.js
- **Git** - [Baixar aqui](https://git-scm.com/)
- **PostgreSQL 12+** - [Baixar aqui](https://www.postgresql.org/download/)

### Opcionais (recomendados)
- **Visual Studio Code** - [Baixar aqui](https://code.visualstudio.com/)
- **DBeaver ou pgAdmin** - Ferramentas para gerenciar banco PostgreSQL
- **Postman ou Insomnia** - Para testar APIs

## ✅ Verificar instalações

Abra um terminal e execute:

```bash
# Verificar Node.js
node --version
# Esperado: v18.x.x ou superior

# Verificar npm
npm --version
# Esperado: 8.x.x ou superior

# Verificar Git
git --version
# Esperado: git version 2.x.x ou superior
```

## 🔧 Setup Automático (Recomendado)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/projeto-web.git
cd projeto-web/backend
```

### 2. Execute o script de setup

#### **Linux/macOS**
```bash
chmod +x setup.sh
./setup.sh
```

#### **Windows (PowerShell)**
```powershell
# Abra como Administrador e execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.sh
```

#### **Windows (Git Bash)**
```bash
bash setup.sh
```

#### **Windows (CMD)**
```cmd
# Copie o conteúdo de setup.sh e execute passo a passo
npm install
npx prisma generate
npx prisma migrate dev
```

### 3. Configure o arquivo `.env`

O script cria um arquivo `.env` automaticamente. Edite-o com suas configurações:

```bash
# Abra o arquivo .env em seu editor
code .env  # VSCode
# ou use qualquer outro editor
```

Exemplo de configuração:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fiscalize?schema=public"

# JWT
JWT_SECRET="sua_chave_secreta_super_segura_aqui_123"
JWT_EXPIRATION="24h"

# Servidor
PORT=3000

# Frontend URL
FRONTEND_URL="http://localhost:3001"

# Ambiente
NODE_ENV="development"
```

### 4. Inicie o servidor

```bash
npm run dev
```

Você deve ver:
```
[INFO] 08:52:53 ts-node-dev ver. 2.0.0
Servidor rodando na porta 3000
```

---

## 🛠️ Setup Manual (Passo a Passo)

Se preferir fazer passo a passo ou o script falhar:

### 1. Instalar dependências

```bash
npm install
```

### 2. Gerar Prisma Client

```bash
npx prisma generate
```

### 3. Criar/Sincronizar banco de dados

```bash
# Criar nova migração (recomendado na primeira vez)
npx prisma migrate dev

# OU sincronizar com schema existente
npx prisma db push
```

### 4. Visualizar banco de dados (opcional)

```bash
npx prisma studio
```

Abre interface gráfica do banco em `http://localhost:5555`

### 5. Executar seed (opcional)

Se houver arquivo `prisma/seed.ts`:

```bash
npx prisma db seed
```

### 6. Iniciar servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm run build
npm start
```

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações da aplicação
│   ├── controllers/      # Controladores de rotas
│   ├── middlewares/      # Middlewares (auth, cors, etc)
│   ├── repositories/     # Acesso ao banco de dados
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários
│   └── server.ts        # Arquivo principal
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts          # Seed (dados iniciais)
├── tests/               # Testes automatizados
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
├── setup.sh             # Script de setup automático
└── SETUP.md            # Este arquivo
```

---

## 🔗 Configurando o Banco de Dados

### Pré-requisito: PostgreSQL instalado

#### **1. Criar banco de dados**

**Windows (usando pgAdmin):**
1. Abra pgAdmin
2. Clique em "Create" > "Database"
3. Nome: `fiscalize`
4. Clique em "Save"

**Linux/macOS (terminal):**
```bash
psql -U postgres -c "CREATE DATABASE fiscalize;"
```

#### **2. Atualizar DATABASE_URL no .env**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/fiscalize?schema=public"
```

Substitua:
- `usuario` - seu usuário PostgreSQL (padrão: `postgres`)
- `senha` - sua senha PostgreSQL
- `localhost` - seu host (padrão: `localhost`)
- `5432` - porta PostgreSQL (padrão: `5432`)
- `fiscalize` - nome do banco

#### **3. Sincronizar schema**

```bash
npx prisma migrate dev --name init
```

---

## 🧪 Testando a API

### Usando cURL

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'

# 2. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }' \
  -c cookies.txt

# 3. Consultar dados do usuário (com cookie)
curl -X GET http://localhost:3000/auth/me \
  -H "Content-Type: application/json" \
  -b cookies.txt

# 4. Fazer logout (com cookie)
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Usando Postman/Insomnia

1. Importe a coleção: [collection.json](./postman-collection.json) (criar se necessário)
2. Configure variável `base_url` = `http://localhost:3000`
3. Execute as requisições

---

## 📦 Scripts disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot-reload

# Build e Produção
npm run build            # Compila TypeScript
npm start                # Inicia servidor compilado

# Testes
npm test                 # Executa testes
npm run test:watch      # Testes em modo watch

# Prisma
npx prisma generate      # Gera Prisma Client
npx prisma migrate dev   # Cria/executa migrações
npx prisma db push       # Sincroniza schema
npx prisma studio       # Abre interface gráfica
npx prisma db seed      # Executa seed
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
# Solução
npx prisma generate
npm install
```

### Erro: "ECONNREFUSED - Connection refused at 127.0.0.1:5432"

**Problema:** PostgreSQL não está rodando

**Solução:**

**Windows:**
```powershell
# Verificar se serviço está rodando
Get-Service postgresql-x64-*

# Iniciar serviço
Start-Service -Name postgresql-x64-15  # Substitua 15 pela sua versão
```

**Linux/macOS:**
```bash
# Verificar status
sudo systemctl status postgresql

# Iniciar
sudo systemctl start postgresql
```

### Erro: "role "postgres" does not exist"

**Problema:** Usuário PostgreSQL não encontrado

**Solução:**
```bash
# Criar usuário (Linux/macOS)
sudo -u postgres createuser seu_usuario

# Ou use pgAdmin para criar novo usuário
```

### Erro: "database "fiscalize" does not exist"

**Problema:** Banco não criado

**Solução:**
```bash
# Criar banco
psql -U postgres -c "CREATE DATABASE fiscalize;"

# Ou use pgAdmin
```

### Erro: "permission denied: ./setup.sh" (Linux/macOS)

**Solução:**
```bash
chmod +x setup.sh
./setup.sh
```

### Porta 3000 já em uso

**Solução 1:** Usar porta diferente
```bash
PORT=3001 npm run dev
```

**Solução 2:** Liberar porta
```bash
# Linux/macOS - encontrar processo na porta 3000
lsof -i :3000

# Encerrar processo
kill -9 <PID>

# Windows - encontrar processo
netstat -ano | findstr :3000

# Encerrar processo
taskkill /PID <PID> /F
```

---

## 🔐 Variáveis de Ambiente

### Obrigatórias
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Chave para assinar tokens JWT | `sua_chave_secreta_aqui` |

### Opcionais
| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3000` |
| `JWT_EXPIRATION` | Expiração do token | `24h` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:3001` |
| `NODE_ENV` | Ambiente | `development` |

---

## 📚 Documentação adicional

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/docs/)
- [JWT](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

## 💬 Dúvidas ou Problemas?

1. Verifique este arquivo SETUP.md
2. Consulte a [seção de Troubleshooting](#-troubleshooting)
3. Abra uma issue no repositório
4. Verifique os logs do servidor para mais detalhes

---

**Última atualização:** 3 de junho de 2026

**Versões testadas:**
- Node.js 18.x - 20.x
- npm 8.x - 10.x
- PostgreSQL 12 - 15
- TypeScript 6.x

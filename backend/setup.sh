#!/bin/bash

# ============================================================================
# Script de Setup do Backend — Fiscalize
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Setup do Backend — Fiscalize${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# ============================================================================
# 1. Verificar Node.js e npm
# ============================================================================
echo -e "${YELLOW}[1/6] Verificando dependências do sistema...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js não encontrado. Instale Node.js 18+ em https://nodejs.org${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm não encontrado. Instale junto com o Node.js.${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ psql não encontrado. Instale o PostgreSQL 14+ antes de continuar.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo -e "${GREEN}✓ psql $(psql --version | awk '{print $3}')${NC}\n"

# ============================================================================
# 2. Instalar dependências npm
# ============================================================================
echo -e "${YELLOW}[2/6] Instalando dependências npm...${NC}"

if [ -f "node_modules/.package-lock.json" ]; then
    echo -e "${YELLOW}Dependências já instaladas. Pulando...${NC}\n"
else
    npm install
    echo -e "${GREEN}✓ Dependências instaladas${NC}\n"
fi

# ============================================================================
# 3. Configurar .env
# ============================================================================
echo -e "${YELLOW}[3/6] Configurando arquivo .env...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}Arquivo .env já existe. Pulando criação...${NC}\n"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Arquivo .env criado a partir de .env.example${NC}"
        echo -e "${YELLOW}⚠ Edite o .env antes de continuar:${NC}"
        echo -e "${YELLOW}  - DATABASE_URL  → URL do seu PostgreSQL${NC}"
        echo -e "${YELLOW}  - JWT_SECRET    → Chave segura para tokens JWT${NC}"
        echo -e "${YELLOW}  - FRONTEND_URL  → URL do frontend (ex: http://localhost:3001)${NC}\n"
        echo -e "${RED}Edite o .env e execute este script novamente.${NC}"
        exit 0
    else
        echo -e "${RED}✗ .env.example não encontrado.${NC}"
        exit 1
    fi
fi

# Ler DATABASE_URL do .env
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
if [ -z "$DB_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL não definida em .env${NC}"
    exit 1
fi

# Extrair host, porta, usuário e nome do banco da URL
DB_USER=$(echo "$DB_URL" | sed -E 's|.*://([^:]+):.*|\1|')
DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DB_URL" | sed -E 's|.*/([^?]+).*|\1|')

echo -e "${GREEN}✓ Banco configurado: ${DB_NAME} em ${DB_HOST}:${DB_PORT}${NC}\n"

# ============================================================================
# 4. Criar banco e instalar extensão uuid-ossp
# ============================================================================
echo -e "${YELLOW}[4/6] Preparando banco de dados...${NC}"

# Criar banco se não existir
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc \
    "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" \
    | grep -q 1 || {
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" \
        -c "CREATE DATABASE \"${DB_NAME}\";" && \
        echo -e "${GREEN}✓ Banco '${DB_NAME}' criado${NC}"
}

# Instalar extensão uuid-ossp (necessária para gerar UUIDs no banco)
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" \
    -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' > /dev/null 2>&1
echo -e "${GREEN}✓ Extensão uuid-ossp instalada${NC}\n"

# ============================================================================
# 5. Executar migrações
# ============================================================================
echo -e "${YELLOW}[5/6] Executando migrações...${NC}"

npx prisma migrate deploy
echo -e "${GREEN}✓ Migrações aplicadas${NC}\n"

# ============================================================================
# 6. Seed (categorias + admin)
# ============================================================================
echo -e "${YELLOW}[6/6] Populando banco com dados iniciais...${NC}"

npx prisma db seed
echo -e "${GREEN}✓ Seed executado (categorias e usuário admin criados)${NC}\n"

# ============================================================================
# Resumo
# ============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Credenciais do Admin:${NC}"
echo -e "  Email: ${BLUE}admin@fiscalize.gov.br${NC}"
echo -e "  Senha: ${BLUE}Admin@123456${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "  1. Inicie o servidor: ${BLUE}npm run dev${NC}"
echo -e "  2. API disponível em: ${BLUE}http://localhost:3000${NC}\n"

echo -e "${YELLOW}Comandos úteis:${NC}"
echo -e "  ${BLUE}npm run dev${NC}              Iniciar servidor em desenvolvimento"
echo -e "  ${BLUE}npx prisma studio${NC}        Visualizar dados do banco"
echo -e "  ${BLUE}npx prisma migrate dev${NC}   Criar nova migração"
echo ""

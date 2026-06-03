#!/bin/bash

# ============================================================================
# Script de Setup do Backend
# Instala dependências, configura banco de dados e prepara o ambiente
# ============================================================================

set -e  # Para a execução se algum comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Iniciando Setup do Backend${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# ============================================================================
# 1. Verificar se Node.js e npm estão instalados
# ============================================================================
echo -e "${YELLOW}[1/6] Verificando dependências do sistema...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js não encontrado. Por favor, instale Node.js 18+ de https://nodejs.org${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm não encontrado. Por favor, instale npm junto com Node.js${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} encontrado${NC}"
echo -e "${GREEN}✓ npm ${NPM_VERSION} encontrado${NC}\n"

# ============================================================================
# 2. Instalar dependências npm
# ============================================================================
echo -e "${YELLOW}[2/6] Instalando dependências npm...${NC}"

if [ -f "node_modules/.package-lock.json" ]; then
    echo -e "${YELLOW}Dependências já instaladas. Pulando...${NC}"
else
    npm install
    echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}\n"
fi

# ============================================================================
# 3. Configurar arquivo .env
# ============================================================================
echo -e "${YELLOW}[3/6] Configurando arquivo .env...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}Arquivo .env já existe. Pulando criação...${NC}"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Arquivo .env criado a partir de .env.example${NC}"
        echo -e "${YELLOW}⚠ IMPORTANTE: Edite o arquivo .env com suas configurações!${NC}"
        echo -e "${YELLOW}  - DATABASE_URL: Sua URL do PostgreSQL${NC}"
        echo -e "${YELLOW}  - JWT_SECRET: Uma chave segura para tokens${NC}"
        echo -e "${YELLOW}  - FRONTEND_URL: URL do seu frontend${NC}"
    else
        echo -e "${RED}✗ Arquivo .env.example não encontrado!${NC}"
        exit 1
    fi
fi

echo ""

# ============================================================================
# 4. Gerar Prisma Client
# ============================================================================
echo -e "${YELLOW}[4/6] Gerando Prisma Client...${NC}"

npx prisma generate
echo -e "${GREEN}✓ Prisma Client gerado com sucesso${NC}\n"

# ============================================================================
# 5. Executar migrações do banco de dados
# ============================================================================
echo -e "${YELLOW}[5/6] Sincronizando banco de dados...${NC}"

if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    npx prisma migrate dev --skip-generate || {
        echo -e "${YELLOW}Não há migrações pendentes ou banco já sincronizado${NC}"
    }
    echo -e "${GREEN}✓ Banco de dados sincronizado${NC}\n"
else
    echo -e "${RED}✗ DATABASE_URL não configurada em .env${NC}"
    echo -e "${YELLOW}Por favor, configure a DATABASE_URL e execute: npx prisma migrate dev${NC}\n"
fi

# ============================================================================
# 6. Executar seed (opcional)
# ============================================================================
echo -e "${YELLOW}[6/6] Verificando seed do banco...${NC}"

if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    read -p "Deseja executar o seed do banco de dados? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npx prisma db seed
        echo -e "${GREEN}✓ Seed executado com sucesso${NC}\n"
    fi
else
    echo -e "${YELLOW}Nenhum seed encontrado. Pulando...${NC}\n"
fi

# ============================================================================
# Resumo final
# ============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "  1. Edite o arquivo ${BLUE}.env${NC} com suas configurações"
echo -e "  2. Inicie o servidor com: ${BLUE}npm run dev${NC}"
echo -e "  3. O servidor rodará em: ${BLUE}http://localhost:\${PORT}${NC}"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo -e "  - ${BLUE}npm run dev${NC}           Iniciar servidor em modo desenvolvimento"
echo -e "  - ${BLUE}npx prisma studio${NC}    Visualizar dados do banco"
echo -e "  - ${BLUE}npx prisma migrate dev${NC} Criar nova migração"
echo ""

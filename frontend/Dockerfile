# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json bun.lock* yarn.lock* npm-shrinkwrap.json* ./

# Instalar dependências
RUN npm ci || npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Definir modo de produção
ENV NODE_ENV=production

# Copiar package.json para instalação de dependências de produção
COPY package.json bun.lock* yarn.lock* npm-shrinkwrap.json* ./

# Instalar apenas dependências de produção
RUN npm ci --only=production || npm install --production

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expor a porta
EXPOSE 3000

# Iniciar a aplicação
CMD ["npm", "start"]

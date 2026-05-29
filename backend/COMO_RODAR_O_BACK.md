# COMO RODAR O BACKEND

## 1) Requisitos minimo
- Node.js 18 ou superior (ja inclui npm).
- PostgreSQL instalado localmente ou Docker disponivel.
- Terminal ou prompt de comando.

## 2) Abrir o backend no terminal
No terminal, acesse a pasta do backend:
```bash
cd c:\Users\camila.alcantara\Documents\GithubRepos\projeto-web\backend
```

## 3) Instalar as dependencias
```bash
npm install
```

## 4) Configurar o banco de dados PostgreSQL
O backend usa Prisma e o arquivo backend/prisma.config.ts aponta para a URL padrao:
```text
postgresql://postgres:BacoExu@localhost:5432/Fiscalize?schema=public
```

### Opcao A: PostgreSQL local
1. Crie um banco de dados chamado Fiscalize.
2. Garanta que usuario e senha sejam:
   - Usuario: postgres
   - Senha: BacoExu
3. Garanta que o PostgreSQL aceite conexoes em localhost:5432.

### Opcao B: Usar Docker
Se voce tiver Docker, execute:
```bash
docker run --name fiscalize-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=BacoExu -e POSTGRES_DB=Fiscalize -p 5432:5432 -d postgres:16
```

## 5) Criar o arquivo de variaveis de ambiente
Na pasta backend/, crie um arquivo .env com:
```env
DATABASE_URL="postgresql://postgres:BacoExu@localhost:5432/Fiscalize?schema=public"
```

> Ajuste a URL se usar outro usuario, senha, host, porta ou nome de banco.

## 6) Gerar o cliente Prisma e aplicar o esquema
No diretorio backend/, execute:
```bash
npx prisma generate
```

Em seguida:
```bash
npx prisma db push
```

Isso criara as tabelas no banco de dados com base em prisma/schema.prisma.

## 7) Rodar o backend
Ainda em backend/:
```bash
npm run dev
```

O servidor deve iniciar em http://localhost:3000.

## 8) Rotas de autenticacao
As rotas disponiveis sao:
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me

## 9) Testar a API com Postman
### 9.1) Registrar usuario
- Metodo: POST
- URL: http://localhost:3000/auth/register
- Body (JSON):
```json
{
  "nome": "Teste",
  "email": "teste@teste.com",
  "senha": "123456",
  "perfil": "cidadao"
}
```

### 9.2) Fazer login
- Metodo: POST
- URL: http://localhost:3000/auth/login
- Body (JSON):
```json
{
  "email": "teste@teste.com",
  "senha": "123456"
}
```

O login retorna um cookie token HTTP-only. No Postman, habilite o envio de cookies automaticamente.

### 9.3) Verificar usuario logado
- Metodo: GET
- URL: http://localhost:3000/auth/me
- Esta rota exige autenticacao via cookie token.

### 9.4) Logout
- Metodo: POST
- URL: http://localhost:3000/auth/logout

## 10) Testar a API com curl
Registrar:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","senha":"123456","perfil":"cidadao"}'
```

Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"123456"}'
```

> Observacao: como o backend usa cookie HTTP-only, curl nao eh ideal para testar rotas protegidas.

## 11) Observacoes finais
- Nao existe suite de testes automatica no backend/package.json alem de um placeholder.
- Para rodar em outra maquina, instale Node.js e PostgreSQL (ou Docker), clone o repositorio e siga estes passos.
- Sempre confirme que o banco esteja online antes de rodar npm run dev.

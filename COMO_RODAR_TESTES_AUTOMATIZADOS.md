# Testes Automatizados com Cypress BDD

Este projeto utiliza o Cypress para testes automatizados E2E (End-to-End).

---

## 🧪 Executando os Testes BDD

### 📂 Entrar na pasta do projeto

```bash
cd projeto-web-main
```

### 📦 Instalar as dependências do projeto

```bash
npm install
```

### 🧰 Instalar dependências do Cypress

Caso necessário:

```bash
npm install -D cypress cypress-xpath
```

### ▶️ Executar testes pelo terminal

```bash
npx cypress run
```

### 🎯 Executar um teste específico pelo terminal

```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

### 🖥️ Executar testes pela interface gráfica

```bash
npx cypress open
```

---

## Estrutura dos testes BDD

```txt
cypress/
 ├── e2e/
 │    ├── login.cy.js
 │    └── chamado.cy.js
 ├── fixtures/
 └── support/
```

---

# Testes Automatizados com Jest ATDD

Este projeto utiliza o Jest para testes automatizados ATDD (Acceptance Test-Driven Development).

---

## 🧪 Executando os Testes ATDD

Os testes ATDD ficam no diretório `frontend/`. Todos os comandos abaixo devem ser executados a partir dessa pasta.

### 📂 Entrar na pasta do frontend

```bash
cd frontend
```

### 📦 Instalar as dependências do projeto

```bash
npm install
```

### 🧰 Instalar dependências de teste

Caso necessário:

```bash
npm install -D jest jest-environment-jsdom @types/jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### ▶️ Executar todos os testes

```bash
npm test
```

### 👀 Executar os testes em modo observação

```bash
npm test -- --watch
```

### 📊 Executar os testes com relatório de cobertura

```bash
npm test -- --coverage
```

---

## Estrutura dos testes ATDD

```txt
frontend/
 ├── jest.config.ts
 ├── jest.setup.ts
 └── src/
      └── tests/
           ├── acceptance/
           │    ├── cidadao-dashboard.test.tsx
           │    ├── dashboard-page.test.tsx
           │    ├── login-page.test.tsx
           │    └── smoke.test.tsx
           └── setup/
                └── jestMocks.ts
```

---

## Credenciais utilizadas nos testes

```txt
Email: joao@example.com
Senha: 123456
```

# Testes Automatizados com Jest TDD (Backend)

Este projeto utiliza o Jest para testes automatizados TDD (Test-Driven Development) no backend, garantindo a integridade das regras de negócio e rotas da API.

---

## 🧪 Executando os Testes TDD

Os testes de unidade e integração do backend ficam no diretório `backend/`. Todos os comandos abaixo devem ser executados a partir dessa pasta.

### 📂 Entrar na pasta do backend

```bash
cd backend
```

### 📦 Instalar as dependências do projeto

```bash
npm install
```

### 🧰 Instalar dependências de teste

Caso necessário:

```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

### ▶️ Executar todos os testes do backend

```bash
npm test
```

### 👀 Executar os testes em modo observação

```bash
npm run test:watch
```

### 📊 Executar os testes com relatório de cobertura

```bash
npm run test:coverage
```

---

## Estrutura dos testes TDD

```txt
backend/
 ├── jest.config.ts
 ├── src/
 │    └── __tests__/
 │         ├── unit/            # Testes de serviços e lógica isolada
 │         └── integration/     # Testes de rotas e integração com banco
 └── package.json
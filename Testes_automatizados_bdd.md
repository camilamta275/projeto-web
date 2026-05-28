# Testes Automatizados com Cypress

Este projeto utiliza o Cypress para testes automatizados E2E (End-to-End).

## Tecnologias utilizadas

* Cypress
* Cypress XPath

---

# Como rodar os testes

## 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

---

## 2. Entrar na pasta do projeto

```bash
cd projeto-web-main
```

---

## 3. Instalar as dependências do projeto

```bash
npm install
```

---

## 4. Instalar dependências do Cypress

Caso necessário:

```bash
npm install -D cypress cypress-xpath
```

---

## 5. Abrir o Cypress

```bash
npx cypress open
```

---

## 6. Executar os testes

# Executar testes pelo terminal

```bash
npx cypress run
```

# Executar um test especifico pelo terminal
```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

---

# Executar testes pela interface gráfica

```bash
npx cypress open
```

# Estrutura dos testes

```txt
cypress/
 ├── e2e/
 │    ├── login.cy.js
 │    └── chamado.cy.js
 ├── fixtures/
 └── support/
```

---

# Credenciais utilizadas nos testes

```txt
Email: joao@example.com
Senha: 123456
```
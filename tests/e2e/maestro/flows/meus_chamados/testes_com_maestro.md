# Testes E2E com Maestro

## 1. Objetivo

Foi realizada a automação de dois cenários End-to-End (E2E) do sistema Fiscalize utilizando o Maestro.

Os testes foram desenvolvidos com foco no fluxo de um cidadão autenticado para consulta de seus chamados.

## 2. Cenários automatizados

### Cenário 1 — Acessar "Meus Chamados" e verificar a listagem

**Arquivo:** `flows/meus_chamados/acessar_meus_chamados.yaml`

O teste realiza as seguintes etapas:

1. Limpa o estado da aplicação.
2. Acessa a tela de login.
3. Realiza login com um usuário cidadão.
4. Verifica se a tela **"Meus Chamados"** está visível.
5. Verifica se o chamado **SCH-2026-0013** aparece na listagem.

**Objetivo:** validar que um cidadão autenticado consegue acessar a área "Meus Chamados" e visualizar um chamado existente.

### Cenário 2 — Login → acessar "Meus Chamados" → verificar um chamado

**Arquivo:** `flows/meus_chamados/login_e_verificar_chamado.yaml`

O teste realiza as seguintes etapas:

1. Limpa o estado da aplicação.
2. Acessa a tela de login.
3. Realiza login com um usuário cidadão.
4. Verifica o acesso à tela **"Meus Chamados"**.
5. Localiza o chamado **SCH-2026-0013**.
6. Acessa os detalhes do chamado.
7. Verifica o protocolo e a descrição apresentada.

**Objetivo:** validar o fluxo completo de consulta de um chamado, desde a autenticação até a visualização de seus detalhes.

## 3. Arquivos utilizados

Os testes estão organizados da seguinte forma:

```text
tests/
└── e2e/
    └── maestro/
        ├── flows/
        │   └── meus_chamados/
        │       ├── acessar_meus_chamados.yaml
        │       └── login_e_verificar_chamado.yaml
        ├── subflows/
        │   └── login.yaml
        ├── config.yaml
        └── ENTREGA.md
```

O arquivo `login.yaml` é utilizado como subfluxo para evitar a duplicação das etapas de autenticação nos cenários.

## 4. Dados utilizados

Os testes utilizam o seguinte usuário de teste:

* **E-mail:** `joao@example.com`
* **Senha:** `123456`

O chamado utilizado para validação é:

* **Protocolo:** `SCH-2026-0013`
* **Descrição:** Encanamento público entupido na Rua da Paz causando retorno de esgoto para dentro de residências no condomínio

## 5. Pré-requisitos

Antes da execução dos testes, é necessário:

* Estar na raiz do projeto;
* Iniciar o sistema Fiscalize;
* Garantir que o frontend esteja disponível em `http://localhost:3001`;
* Ter o Maestro instalado e disponível no terminal.

## 6. Execução

A partir da raiz do projeto, executar cada cenário individualmente.

### Cenário 1

```powershell
maestro test tests/e2e/maestro/flows/meus_chamados/acessar_meus_chamados.yaml
```

### Cenário 2

```powershell
maestro test tests/e2e/maestro/flows/meus_chamados/login_e_verificar_chamado.yaml
```

## 7. Resultado

Os dois cenários foram executados com sucesso no ambiente de testes.

O primeiro cenário valida o acesso e a visualização de um chamado na listagem.

O segundo cenário valida uma jornada mais completa, envolvendo autenticação, acesso à listagem, abertura de um chamado e verificação das informações apresentadas em seus detalhes.

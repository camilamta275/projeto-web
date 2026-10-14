# Documentação da Pipeline de Regressão — Projeto Web

## 1. Objetivo

Este documento registra o trabalho realizado para configurar, executar e corrigir a pipeline de regressão automatizada do projeto **Fiscalize**, utilizando o GitHub Actions.

O objetivo foi centralizar a execução dos testes automatizados em um único workflow, permitindo verificar funcionalidades da aplicação e identificar falhas antes de considerar uma alteração validada.

A pipeline contempla testes com Jest, testes End-to-End (E2E) com Cypress e um fluxo de smoke test com Maestro para Web.

## 2. Configuração do GitHub Actions

Foi criado o arquivo:

`.github/workflows/regressao.yml`

O workflow foi configurado para execução manual por meio do evento `workflow_dispatch`, permitindo iniciar a regressão pela aba **Actions** do GitHub, sem executar automaticamente a cada alteração no repositório.

A configuração utiliza um ambiente baseado em Ubuntu e organiza as atividades em etapas sequenciais.

### 2.1. Etapas da pipeline

O fluxo de execução contempla:

1. **Checkout do repositório:** obtém o código-fonte necessário para executar os testes.
2. **Configuração do Node.js:** utiliza a versão `22.14.0`.
3. **Instalação das dependências:** executa `npm ci` na raiz do projeto e `npm ci --prefix frontend` para instalar as dependências do frontend.
4. **Testes automatizados com Jest:** executa as etapas de testes unitários, testes de API e testes de aceitação previstas no workflow.
5. **Testes E2E com Cypress:** executa os cenários selecionados de login e abertura de chamado.
6. **Configuração do Java:** utiliza Java 17 para preparar o ambiente necessário ao Maestro.
7. **Smoke test com Maestro Web:** executa o fluxo de smoke test configurado em `tests/e2e/maestro`.

A execução sequencial permite identificar em qual etapa ocorre uma falha e consultar os logs correspondentes no GitHub Actions.

## 3. Instalação e sincronização das dependências

Durante a preparação da pipeline, foi necessário garantir que as dependências do projeto pudessem ser instaladas de maneira reproduzível no ambiente de CI.

O comando `npm ci` foi utilizado por instalar as dependências a partir do arquivo de lock, evitando a resolução livre de versões durante a execução.

Também foi identificada a necessidade de sincronizar o lockfile do frontend com as dependências declaradas no respectivo `package.json`.

Essa correção foi registrada no commit:

* **Commit:** `2254f47`
* **Mensagem:** `fix: sync frontend dependency lockfile`

Essa etapa é importante porque divergências entre o manifesto de dependências e o lockfile podem impedir a instalação em ambientes automatizados, mesmo quando o projeto funciona na máquina de desenvolvimento.

## 4. Testes automatizados com Jest

A pipeline contempla as etapas de testes unitários, de API e de aceitação executadas com Jest.

Esses testes são importantes para verificar o comportamento de unidades de código, funcionalidades relacionadas à API e cenários de aceitação cobertos pela suíte existente.

Durante a investigação das falhas da pipeline, as etapas do Jest foram executadas com sucesso no workflow analisado, permitindo direcionar a investigação para os testes E2E.

## 5. Testes End-to-End com Cypress

O Cypress foi utilizado para validar fluxos de interação da aplicação web.

Os cenários selecionados na pipeline foram:

* `cypress/e2e/login.cy.js`
* `cypress/e2e/open_chamado.cy.js`

### 5.1. Teste de login

O cenário de login acessa a aplicação publicada, preenche os campos de e-mail e senha, aciona o botão de entrada e verifica se a tela **Meus Chamados** é apresentada.

Esse teste já passou durante as execuções locais de validação.

### 5.2. Teste de abertura de chamado

O cenário de abertura de chamado verifica o fluxo de criação de uma solicitação, incluindo:

1. Acesso à aplicação e autenticação.
2. Navegação para a tela de novo chamado.
3. Seleção da categoria do problema.
4. Preenchimento da descrição e do endereço.
5. Avanço para a etapa de confirmação.
6. Envio do chamado.
7. Validação do protocolo retornado.
8. Verificação da presença do chamado na listagem.

### 5.3. Problema identificado na execução

Na execução do workflow, o teste falhou ao procurar a categoria **“Problemas na Via”**.

A investigação mostrou que a interface carregava as categorias diretamente do endpoint `/categories`, mas o backend configurado retornava o erro `404 Application not found`.

Como consequência, a tela apresentava a mensagem **“Nenhuma categoria encontrada.”**

O problema não estava necessariamente no seletor do Cypress: a aplicação não recebia as categorias necessárias para continuar o fluxo.

### 5.4. Correção com `cy.intercept()`

Para tornar o cenário de abertura de chamado independente da disponibilidade do backend externo, foram adicionadas interceptações no arquivo `cypress/e2e/open_chamado.cy.js`.

As interceptações simulam três operações:

* `GET /categories`: retorna uma categoria de teste chamada `Problemas na Via`.
* `POST /demands`: simula a criação de um chamado e retorna o protocolo `SCH-2026-001`.
* `GET /demands`: retorna uma lista que contém o chamado criado.

Com essas respostas simuladas, o teste consegue validar o fluxo da interface sem depender da API externa para essas operações.

A correção foi registrada no commit:

* **Commit:** `eba87d8`
* **Mensagem:** `test: mock API in ticket creation e2e`

### 5.5. Validação local do Cypress

O teste de abertura de chamado foi executado isoladamente:

```powershell
npx cypress run --spec "cypress/e2e/open_chamado.cy.js"
```

Resultado:

* 1 teste aprovado.
* 0 falhas.

Em seguida, os dois cenários foram executados juntos:

```powershell
npx cypress run --spec "cypress/e2e/login.cy.js,cypress/e2e/open_chamado.cy.js"
```

Resultado:

* `login.cy.js`: aprovado.
* `open_chamado.cy.js`: aprovado.
* **Total: 2 testes aprovados e 0 falhas.**

Esses resultados confirmam que os dois cenários passaram na validação local com a configuração utilizada.

## 6. Smoke test com Maestro Web

O workflow também contempla uma etapa de smoke test utilizando o Maestro para Web.

Para preparar essa etapa, a pipeline configura o Java 17 e instala ou disponibiliza a ferramenta Maestro CLI, conforme definido no workflow.

O objetivo do smoke test é realizar uma verificação rápida de um fluxo essencial da aplicação, complementando os testes executados pelo Jest e pelo Cypress.

Essa etapa utiliza os fluxos localizados em `tests/e2e/maestro`.

## 7. Organização e controle de versão

O trabalho foi realizado na branch `tests`, mantendo as alterações separadas da branch principal `main`.

Os commits relacionados à configuração e à correção da pipeline foram:

| Commit    | Descrição                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `7d3eb1e` | `ci: configure regression pipeline` — configuração do workflow de regressão                              |
| `2254f47` | `fix: sync frontend dependency lockfile` — sincronização das dependências do frontend                    |
| `eba87d8` | `test: mock API in ticket creation e2e` — simulação das respostas da API no teste de abertura de chamado |

Antes do commit da correção E2E, foi executado `git diff --check` para verificar problemas de formatação. Também foi conferido o conteúdo preparado para commit, garantindo que somente o arquivo do teste fosse incluído.

A pasta auxiliar `backend-inspect/`, utilizada durante a investigação do backend, permaneceu fora do commit.

## 8. Limitações e considerações

A utilização de respostas simuladas torna o teste E2E mais independente de serviços externos, mas é importante distinguir o que está sendo validado.

* **Testes com API simulada:** verificam o comportamento da interface diante das respostas definidas no teste.
* **Testes de integração real:** verificam a comunicação efetiva com o backend e dependem de um serviço disponível e configurado corretamente.

Portanto, a aprovação local dos testes Cypress não comprova, isoladamente, que o backend real esteja operacional.

O erro `Application not found` encontrado durante a investigação deve ser tratado separadamente caso seja necessário validar a integração real da aplicação.

Além disso, o teste de login continua acessando a aplicação web publicada. As interceptações adicionadas ao teste de abertura de chamado não tornam toda a suíte independente de serviços externos.

## 9. Resultado do trabalho

O trabalho realizado incluiu:

* Configuração de uma pipeline manual de regressão no GitHub Actions.
* Preparação do ambiente Node.js e Java.
* Instalação reproduzível das dependências.
* Sincronização do lockfile do frontend.
* Execução das etapas de testes com Jest.
* Integração dos cenários E2E de login e abertura de chamado com Cypress.
* Investigação da falha causada pela indisponibilidade do backend.
* Simulação de respostas da API no teste de abertura de chamado.
* Validação local dos dois cenários Cypress, ambos aprovados.
* Organização das alterações em commits na branch `tests`.

A pipeline reúne diferentes níveis de verificação automatizada em um único fluxo, facilitando a identificação de falhas e a repetição dos testes.

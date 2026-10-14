# Entrega E2E — Ana Sofia

## Cenário automatizado

Login do cidadão com senha inválida: usuário informa um e-mail real (`cidadao@fiscalize.gov.br`) e uma senha errada, tenta entrar, e a aplicação exibe a mensagem de erro sem deixar o usuário acessar o sistema.

Corresponde ao **TC02** do plano de automação do grupo ("Login com senha inválida"). Foi escolhido depois de revisar tanto os testes já existentes na branch `test` quanto o plano de casos de teste do grupo: login válido (TC01), abertura de chamado (TC03) e conclusão de chamado pelo gestor (TC16) já estavam cobertos por colegas; TC02 ainda não tinha nenhum teste E2E.

Arquivo: [`flows/login_invalido.yaml`](flows/login_invalido.yaml)

## Objetivo

Garantir que a aplicação rejeita corretamente credenciais inválidas — exibindo uma mensagem de erro clara e mantendo o usuário na tela de login — em vez de permitir acesso indevido ou falhar silenciosamente.

## Pré-requisitos

- Backend rodando em `http://localhost:3000` e frontend em `http://localhost:3001`.
- Banco com o seed aplicado (usa o usuário `cidadao@fiscalize.gov.br`, criado pelo seed; a senha usada no teste é proposital e errada).
- [Maestro CLI](https://maestro.dev) instalado (requer Java).

## Como executar

```bash
maestro test tests/e2e/maestro/flows/login_invalido.yaml
```

Para rodar junto com o resto da suíte do grupo:

```bash
maestro test tests/e2e/maestro/flows
```

## Resultado esperado

O Maestro abre o Chromium, preenche o formulário de login com e-mail válido e senha incorreta, clica em "Entrar" e valida que aparece o toast de erro "Erro ao entrar" / "E-mail ou senha incorretos", e que o botão "Entrar" continua visível (ou seja, o usuário não foi autenticado nem redirecionado).

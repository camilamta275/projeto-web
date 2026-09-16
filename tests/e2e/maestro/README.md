# Testes E2E com Maestro

Estrutura básica de testes E2E para o frontend (Next.js, `http://localhost:3001`) usando o [Maestro](https://maestro.dev) em modo web.

## Estrutura

```
tests/e2e/maestro/
├── config.yaml             # workspace config (quais flows rodar, tags)
├── subflows/
│   └── login.yaml          # login reutilizável, recebe EMAIL/SENHA como env
└── flows/
    ├── smoke_home_redirects_to_login.yaml   # smoke test: "/" redireciona pra /login
    ├── login_cidadao.yaml                   # login como cidadão, via subflow + assert do dashboard
    └── gestor_resolve_chamado.yaml          # login como gestor EMLURB, resolve um chamado na fila
```

## Pré-requisitos

1. Backend rodando em `http://localhost:3000` e frontend em `http://localhost:3001` (`npm run dev` na raiz do projeto).
2. Banco com o seed aplicado (`npm run seed --prefix backend`), pois `login_cidadao.yaml` usa o usuário demo `cidadao@fiscalize.gov.br` / `Cidadao@123456`.
3. Maestro CLI instalado (`curl -Ls "https://get.maestro.mobile.dev" | bash`).

## Rodando

```bash
maestro test tests/e2e/maestro/flows/smoke_home_redirects_to_login.yaml
maestro test tests/e2e/maestro/flows/login_cidadao.yaml
maestro test tests/e2e/maestro/flows/gestor_resolve_chamado.yaml

# todos de uma vez
maestro test tests/e2e/maestro/

# só os smoke tests
maestro test tests/e2e/maestro/ --include-tags=smoke
```

Adicione `--headless` para rodar sem abrir a janela do Chromium.

## Subflow de login

`subflows/login.yaml` recebe `EMAIL` e `SENHA` via `env:` do flow que o chama, então dá pra reusar pra qualquer perfil (cidadão, gestor, admin) sem duplicar os passos de digitar e entrar:

```yaml
# flows/login_gestor.yaml (exemplo)
url: http://localhost:3001/login
tags:
  - auth
env:
  EMAIL: gestor@fiscalize.gov.br
  SENHA: Gestor@123456
---
- clearState
- launchApp
- runFlow: ../subflows/login.yaml
- assertVisible: "..." # algo específico da tela do gestor
```

Importante: o subflow precisa de um `url:` no cabeçalho (mesma URL do flow pai) — o parser do Maestro exige esse campo em todo arquivo de flow quando rodando web, mesmo em subflows chamados via `runFlow`.

## gestor_resolve_chamado.yaml

Login como gestor EMLURB (`gestor@fiscalize.gov.br`), acessa a fila, busca o chamado `DEM-SEED-004` (status `Em Andamento` no seed), abre os detalhes, clica em "Concluir", preenche a justificativa e confirma. No fim, verifica que o status virou `Resolvido`.

Importante: esse flow **muda dado real no banco** (marca `DEM-SEED-004` como `Resolvido`). Ele não é idempotente, rodar de novo sem resetar o status falha na asserção "Em Andamento" porque o chamado já estará resolvido. Para rodar de novo, resete o status antes:

```sql
UPDATE chamado SET status = 'Em Andamento' WHERE protocolo = 'DEM-SEED-004';
```

## Notas

- Suporte web do Maestro é experimental: os seletores (`tapOn`, `assertVisible`) casam com texto visível na página, incluindo `placeholder` de inputs — por isso os flows usam os placeholders ("seu@email.com", "qualquer senha") em vez de IDs, já que os componentes (Chakra UI) não expõem `id`/`data-testid` fixos.
- Use `url:` (não `appId:`) no cabeçalho de cada flow — é isso que faz o Maestro reconhecer o teste como web e subir o Chromium sozinho.

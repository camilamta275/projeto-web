# Testes E2E com Maestro

Estrutura básica de testes E2E para o frontend (Next.js, `http://localhost:3001`) usando o [Maestro](https://maestro.dev) em modo web.

## Estrutura

```
maestro/
├── config.yaml           # workspace config (quais flows rodar)
└── flows/
    ├── smoke_home_redirects_to_login.yaml   # smoke test: "/" redireciona pra /login
    └── login_cidadao.yaml                   # fluxo de login com usuário demo (cidadão)
```

## Pré-requisitos

1. Backend rodando em `http://localhost:3000` e frontend em `http://localhost:3001` (`npm run dev` na raiz do projeto).
2. Banco com o seed aplicado (`npm run seed --prefix backend`), pois `login_cidadao.yaml` usa o usuário demo `cidadao@fiscalize.gov.br` / `Cidadao@123456`.
3. Maestro CLI instalado (`curl -Ls "https://get.maestro.mobile.dev" | bash`).

## Rodando

```bash
cd maestro
maestro test -p web --headless flows/smoke_home_redirects_to_login.yaml
maestro test -p web --headless flows/login_cidadao.yaml

# ou todos de uma vez, seguindo o config.yaml
maestro test -p web --headless .
```

Remova `--headless` para ver o Chromium abrindo durante o teste.

## Notas

- Suporte web do Maestro é experimental: os seletores (`tapOn`, `assertVisible`) casam com texto visível na página, incluindo `placeholder` de inputs — por isso os flows usam os placeholders ("seu@email.com", "qualquer senha") em vez de IDs, já que os componentes (Chakra UI) não expõem `id`/`data-testid` fixos.
- Cada flow começa com `appId: <url>` apontando para a rota inicial daquele fluxo.

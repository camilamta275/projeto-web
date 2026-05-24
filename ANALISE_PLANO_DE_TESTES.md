# Análise do Plano de Testes vs. Estado Atual do Projeto

**Documento de referência:** `Copy of [Template]Plano de Testes.md`
**Repositório auditado:** `projeto-web/` (frontend Next.js 14 + Chakra UI + Zustand; backend praticamente vazio)
**Data da análise:** 2026-05-23

---

## 1. Casos de teste já executáveis

| TC | Cenário | Status | Onde está implementado |
|----|---------|--------|------------------------|
| **TC01** | Login do Cidadão (TS01) | ⚠️ Parcial | `app/login/page.tsx` + `components/LoginForm.tsx` + `stores/authStore.ts`. Funciona, **mas o redirecionamento vai para `/dashboard`, não para `/cidadao/chamados`**. |
| **TC03** | Registro de chamado em 3 etapas (TS04) | ⚠️ Parcial | `app/cidadao/chamados/novo/page.tsx`. As 3 etapas (Categoria → Detalhes → Confirmar) e a barra de progresso estão prontas. **Não tem upload de foto e a geolocalização é hardcoded** (`lat: -8.0476, lng: -34.877`). |
| **TC04** | Validação de limites mínimos (TS05) | ✅ Total | `validateStep2()` em `novo/page.tsx:105-113` cobre exatamente "≥ 20 caracteres" e "≥ 5 caracteres". |
| **TC05** | Geração de protocolo `SCH-AAAA-NNNN` (TS06) | ✅ Total | `novo/page.tsx:122-125` — `SCH-${ano}-${seq}` é exibido em toast e persistido no `chamadosStore`. |
| **TC07** | Dashboard do Gestor — KPIs + mapa de calor (TS10) | ✅ Total | `app/gestor/dashboard/page.tsx`. KPICards, Heatmap (Leaflet via dynamic import), alertas críticos e filtro de SLA estão funcionais. |
| **TC08** | Filtragem da fila (TS11) | ⚠️ Parcial | `app/gestor/fila/page.tsx` tem filtros de status, prioridade, período e busca. **A massa é hardcoded com apenas 4 chamados** (a pré-condição pede ≥ 10). |
| **TC11** | Exportação de relatório PDF/Excel (TS16) | ✅ Total | `app/gestor/relatorios/page.tsx` usa `jspdf + jspdf-autotable` para PDF e `xlsx` para Excel. |
| **TC12** | Criação de novo órgão (TS17) | ⚠️ Parcial | `app/admin/orgaos/page.tsx` cria/edita órgão (sigla, nome, tipo, SLA, responsável, email). **O modal não tem o seletor de categorias de competência** — categorias só aparecem nos cards. A "Matriz de Competências" em `/admin/matriz` é puramente mock (`salvarRegra` apenas fecha o modal, conforme comentário do próprio código). |
| TS03 | Lista "Meus Chamados" com status coloridos | ✅ | `app/cidadao/chamados/page.tsx` + `ChamadoCardV2` + `StatusBadge`. |
| TS08 | Timeline do chamado (cidadão) | ✅ | `app/cidadao/chamados/[id]/page.tsx` renderiza `TicketTimeline`. |
| TS14 | Cálculo de SLA por categoria | ✅ | Tabela `CATEGORIAS` em `novo/page.tsx` mapeia `slaHoras` por tipo (24/36/48/72h) e grava em `chamadosStore`. |
| TS15 | Mapa de calor `/gestor/mapa` | ✅ | `app/gestor/mapa/page.tsx` com filtros e Leaflet.heat (dados mock). |

---

## 2. Casos de teste que **não** podem ser testados como descritos

| TC | Cenário | Bloqueio |
|----|---------|----------|
| **TC02** | Login com senha inválida (TS02) | `authStore.login` ignora a senha — só compara o email contra a lista mock. **Qualquer senha "passa" se o email existir**, e o erro retornado é "Usuário não encontrado", não "E-mail ou senha incorretos". O resultado esperado do plano não é alcançável sem alterar o store. |
| **TC06** | Login do Gestor e redirecionamento para `/gestor/dashboard` (TS09) | `LoginForm.onSubmit` redireciona **todos os perfis para `/dashboard`** (`router.push('/dashboard')`). Não há lógica que envie o gestor para `/gestor/dashboard` nem o admin para `/admin`. |
| **TC09** | Aceitar → Em andamento → Concluir, com timeline e notificação (TS12) | `app/gestor/chamados/[id]/page.tsx` é **estático**: o chamado é uma constante hardcoded; `handleAceitar`, `handleConcluir`, `handlePausarSLA`, `handleDesignarEquipe` apenas disparam `toast`. Não atualizam status, não acrescentam evento à timeline, não geram notificação ao cidadão. |
| **TC10** | Encaminhar para outro órgão (TS13) | Mesma página: `handleEncaminhar` só mostra toast. Não move o chamado entre filas, não persiste justificativa nem registra evento na timeline. |
| **TC13** | Middleware bloqueia rota protegida (TS19) e perfil errado (TS20) | Dois problemas: (1) `authStore` é Zustand puro — **nunca grava o cookie `session`** que `middleware.ts:18` consulta, então em tese todas as rotas protegidas redirecionariam para `/login` mesmo após login. (2) O `middleware.ts` **não diferencia perfil** — só verifica existência do cookie; não há bloqueio de Cidadão acessando `/admin` ou `/gestor`. O `ProtectedRoute.tsx` faz role-check, mas não está aplicado nos `layout.tsx` de `/cidadao`, `/gestor`, `/admin`. |
| TS07 | Notificação in-app após mudança de status | `notificacoesStore` e a página `/cidadao/notificacoes` existem, mas **não há código que crie uma notificação quando o status muda** (todas as ações do gestor são toast-only). |
| TS18 | Vinculação de gestor ao órgão correto | `/admin/usuarios` permite criar gestor com órgão, mas o vínculo é local-state apenas (nada conecta esse novo gestor à fila do órgão). |
| TS04 (parte foto/GPS) | Foto + geolocalização real | Não há `<input type="file">` nem `navigator.geolocation.getCurrentPosition`. Coordenadas são fixas. |

---

## 3. Lacunas estruturais que afetam todo o plano

- **Backend vazio:** `backend/src/server.ts` tem 0 bytes. Tudo roda em Zustand + json-server local. Os testes de integração (TS05, TS08, TS12, TS14) não têm camada real para integrar.
- **Persistência inconsistente:** cada tela tem sua própria lista mock (`/admin/orgaos` ≠ `/admin/matriz` ≠ `/gestor/fila` ≠ `chamadosStore`). Um chamado criado pelo cidadão **não aparece** na fila do gestor, o que inviabiliza qualquer teste E2E "Cidadão registra → Gestor triagem → Conclusão".
- **Sem cobertura de testes automatizada:** não há `jest`, `vitest`, `@testing-library` ou `playwright` no `package.json`. O plano cita Playwright como mitigação de risco, mas ele não está instalado.

---

## 4. Resumo executivo

- **Prontos para execução manual sem ressalvas (5):** TC04, TC05, TC07, TC11, e os cenários auxiliares TS03/TS08/TS14/TS15.
- **Executáveis com ajustes simples no plano ou no código (4):** TC01 (corrigir redirect), TC03 (sem foto/GPS reais), TC08 (popular massa ≥ 10), TC12 (categorias no form).
- **Bloqueados até implementação (5):** TC02 (senha não validada), TC06 (redirect por perfil), TC09 e TC10 (ações do gestor são fake), TC13 (middleware não checa perfil e auth não grava cookie).

---

## 5. Recomendações para destravar a execução

Antes da janela de execução, priorizar:

1. Gravar `session` cookie no `authStore` no momento do login.
2. Implementar redirect por `usuario.perfil` no `LoginForm` (cidadão → `/cidadao/chamados`, gestor → `/gestor/dashboard`, admin → `/admin`).
3. Ligar as ações do gestor (`Aceitar`, `Encaminhar`, `Concluir`, `Pausar SLA`) ao `chamadosStore` para gerar timeline + notificação.
4. Unificar a fonte de dados de chamados entre cidadão e gestor (uma única store/coleção).
5. Validar senha no `authStore` (mesmo que mock — exigir uma senha fixa por usuário).
6. Adicionar checagem de perfil no `middleware.ts` ou aplicar `ProtectedRoute` nos layouts.

Esses ajustes destravam **5 dos 8 casos hoje bloqueados ou parciais**.

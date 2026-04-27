# Modelo Conceitual
## Sistema de Gerenciamento de Chamados Públicos (Prefeitura)

---

## 📌 Visão Geral

O Modelo Conceitual identifica as **entidades principais** (conceitos do negócio) e seus **relacionamentos** sem considerar implementação técnica.

```
Usuários do Sistema reportam Problemas → Sistema roteia para Órgãos → Gestores rastreiam SLA
```

---

## 🏢 Entidades Principais

### 1. **CIDADÃO** (Specialização de USUARIO)

**Definição**: Pessoa que reporta problemas públicos à administração

**Atributos**:
- `id` (PK): Identificador único
- `nome`: Nome completo
- `email`: E-mail para contato e login
- `cpf`: CPF (opcional, identificação brasileira)
- `perfil`: "Cidadão" (fixo)
- `status`: "Ativo" | "Inativo"
- `criadoEm`: Data/hora de cadastro
- `endereco`: Endereço residencial (opcional)

**Constraints**:
- Email é ÚNICO
- CPF é ÚNICO (se fornecido)
- Email deve ser válido

**Relacionamentos**:
- **1 cidadão : N chamados** (um cidadão reporta múltiplos chamados)
- **1 cidadão : N notificações** (recebe notificações sobre status)

---

### 2. **GESTOR** (Specialização de USUARIO)

**Definição**: Funcionário público de um órgão que gerencia chamados

**Atributos**:
- `id` (PK): Identificador único
- `nome`: Nome completo
- `email`: E-mail corporativo
- `perfil`: "Gestor" (fixo)
- `orgaoId` (FK): Órgão onde trabalha
- `status`: "Ativo" | "Inativo"
- `criadoEm`: Data/hora de cadastro
- `departamento`: Setor/departamento (opcional)
- `telefone`: Telefone corporativo (opcional)

**Constraints**:
- Email é ÚNICO
- Deve estar vinculado a exatamente 1 Órgão
- Email corporativo (domínio verificado)

**Relacionamentos**:
- **N gestores : 1 órgão** (múltiplos gestores em 1 órgão)
- **1 gestor : N chamados** (atribui-se a múltiplos chamados)
- **1 gestor : N notificações** (recebe notificações)

---

### 3. **ADMIN** (Especialização de USUARIO)

**Definição**: Administrador do sistema com acesso total

**Atributos**:
- `id` (PK)
- `nome`: Nome completo
- `email`: E-mail
- `perfil`: "Admin" (fixo)
- `status`: "Ativo" | "Inativo"
- `criadoEm`: Data/hora de cadastro

**Relacionamentos**:
- **1 admin : N órgãos** (cria/edita órgãos)
- **1 admin : N usuários** (cria/ativa/desativa usuários)
- **1 admin : N regras_competencia** (define regras de roteamento)

---

### 4. **CHAMADO** (Entidade Central)

**Definição**: Registro de um problema público reportado

**Atributos**:
- `id` (PK): Identificador único (UUID)
- `protocolo` (Unique): Número público (ex: SCH-2026-00001)
- `descricao`: Descrição do problema (0-1000 caracteres)
- `cidadaoId` (FK): Quem reportou
- `gestorId` (FK, nullable): Gestor atribuído
- `orgaoId` (FK): Órgão responsável (via roteamento automático)
- `categoria`: Classificação (enum: Via, Água/Esgoto, Iluminação, Saneamento, Sinalização, Outros)
- `subcategoria`: Subclassificação (ex: "Buraco", "Vazamento")
- `endereco`: Localização textual
- `latitude`: Coordenada GPS
- `longitude`: Coordenada GPS
- `status`: Estado do chamado (enum: Aberto, Em Análise, Em Andamento, Aguardando, Resolvido, Fechado)
- `prioridade`: Nível de urgência (enum: Baixa, Média, Alta, Crítica)
- `fotoUrl`: Foto do problema
- `slaHoras`: Prazo em horas (do Órgão)
- `slaDeadline`: Data/hora limite
- `slaEncerradoHa`: Horas após vencimento (nullable)
- `slaJustification`: Justificativa de atraso (nullable)
- `resolutionNote`: Nota de conclusão (nullable)
- `resolutionPhotoUrl`: Foto de conclusão (nullable)
- `criadoEm`: Data de criação
- `atualizadoEm`: Data última atualização

**Constraints**:
- Status segue workflow: Aberto → Em Análise → Em Andamento → Aguardando → Resolvido → Fechado
- Apenas transições de status válidas permitidas
- slaDeadline = criadoEm + (slaHoras * 3600)
- Se status = "Resolvido" ou "Fechado", resolutionNote é OBRIGATÓRIO

**Relacionamentos**:
- **N chamados : 1 cidadão** (FK: cidadaoId)
- **N chamados : 1 gestor** (FK: gestorId, nullable até atribuição)
- **N chamados : 1 órgão** (FK: orgaoId)
- **1 chamado : N timeline_events** (histórico de mudanças)
- **1 chamado : N notificações** (eventos gerados)

---

### 5. **ÓRGÃO** (Governo/Concessionária)

**Definição**: Entidade pública/privada responsável por resolver chamados

**Atributos**:
- `id` (PK): Identificador (ex: "PMR", "COMPESA")
- `nome`: Nome completo (ex: "Prefeitura Municipal do Recife")
- `sigla`: Acrônimo (2-10 caracteres)
- `tipo`: Classificação (enum: Municipal, Estadual, Federal, Concessionária)
- `slaHoras`: Prazo padrão em horas (ex: 48)
- `responsavel`: Pessoa de contato
- `email`: E-mail corporativo
- `telefone`: Telefone (opcional)
- `status`: "Ativo" | "Inativo"
- `criadoEm`: Data de cadastro

**Constraints**:
- `id` é ÚNICO
- `sigla` é ÚNICA
- slaHoras > 0
- Email é válido

**Relacionamentos**:
- **1 órgão : N gestores** (emprega múltiplos gestores)
- **1 órgão : N chamados** (responsável por resolver)
- **1 órgão : N regras_competencia** (participa de roteamento)
- **N órgãos : N categorias** (via tabela associativa)

---

### 6. **REGRA_COMPETÊNCIA**

**Definição**: Regra de roteamento automático de chamados para órgãos

**Atributos**:
- `id` (PK): Identificador único
- `categoria` (FK): Tipo de problema
- `subcategoria`: Subtipo específico
- `orgaoPrincipalId` (FK): Órgão responsável principal
- `orgaoSecundarioId` (FK, nullable): Órgão fallback
- `slaHoras`: SLA para esta combinação (override do padrão)
- `prioridade`: Prioridade padrão (enum: Baixa, Média, Alta, Crítica)

**Constraints**:
- Combinação (categoria, subcategoria) deve ser ÚNICA
- orgaoPrincipalId ≠ orgaoSecundarioId (se ambos preenchidos)
- slaHoras > 0

**Exemplo de Dados**:
| Categoria | Subcategoria | Órgão Principal | SLA | Prioridade |
|-----------|--------------|-----------------|-----|-----------|
| Água/Esgoto | Vazamento | COMPESA | 36h | Média |
| Iluminação | Lâmpada | Energisa | 24h | Média |
| Via | Buraco | PMR | 48h | Média |

**Relacionamentos**:
- **N regras : 1 categoria** (múltiplas regras por categoria)
- **N regras : 1 órgão_principal** (FK)
- **N regras : 1 órgão_secundário** (FK, opcional)

---

### 7. **NOTIFICAÇÃO**

**Definição**: Mensagem gerada para notificar usuários sobre eventos

**Atributos**:
- `id` (PK): Identificador único
- `usuarioId` (FK): Destinatário
- `titulo`: Resumo da mensagem
- `mensagem`: Corpo do texto
- `tipo`: Evento que gerou (enum: chamado, status, equipe, concluido)
- `chamadoId` (FK, nullable): Referência ao chamado (se relevante)
- `lida`: Booleano (lida ou não)
- `criadoEm`: Data da geração

**Constraints**:
- Uma notificação sempre referencia um usuário
- Se tipo relacionado a chamado, chamadoId é OBRIGATÓRIO

**Tipos de Notificação**:
- **"chamado-registrado"**: Cidadão cria chamado
- **"status-atualizado"**: Status de chamado muda
- **"equipe-designada"**: Gestor atribuído
- **"chamado-concluido"**: Chamado resolvido

**Relacionamentos**:
- **N notificações : 1 usuário** (FK: usuarioId)
- **N notificações : 1 chamado** (FK: chamadoId)

---

### 8. **TIMELINE_EVENT** (Auditoria Imutável)

**Definição**: Registro de cada mudança em um chamado (não pode ser deletado/alterado)

**Atributos**:
- `id` (PK): Identificador único
- `chamadoId` (FK): Qual chamado mudou
- `tipo`: Tipo de evento (enum: criacao, status, mensagem, transferencia, conclusao)
- `titulo`: Título do evento (opcional)
- `descricao`: O que mudou (ex: "Status alterado de 'Aberto' para 'Em Análise'")
- `autor`: Quem fez a mudança (nome de usuário)
- `timestamp`: Quando ocorreu

**Constraint de Imutabilidade**:
- Uma vez inserido, NEVER é deletado ou modificado
- Triggers previnem UPDATE/DELETE

**Tipos de Evento**:
| Tipo | Exemplo |
|------|---------|
| criacao | "Chamado criado por João Silva" |
| status | "Status alterado de 'Aberto' → 'Em Análise' por Maria" |
| mensagem | "Mensagem adicionada: 'Será resolvido hoje'" |
| transferencia | "Transferido de Pedro para Ana" |
| conclusao | "Resolvido com foto: [URL]" |

**Relacionamentos**:
- **N timeline_events : 1 chamado** (FK: chamadoId)

---

### 9. **CATEGORIA** (Tabela de Referência)

**Definição**: Conjunto fixo de categorias de problemas

**Atributos**:
- `id` (PK): Identificador
- `nome`: Nome descritivo (ex: "Problemas na Via")
- `descricao`: Explicação
- `ativo`: Booleano

**Valores Fixos**:
1. Problemas na Via (Ruas, pavimentação, buracos)
2. Água e Esgoto (Vazamentos, entupimentos)
3. Iluminação Pública (Lâmpadas, postes)
4. Saneamento Básico (Lixo, higiene)
5. Sinalização (Placas, placas de trânsito)
6. Outros Problemas

**Relacionamentos**:
- **N regras_competencia : 1 categoria** (roteamento)
- **N chamados : 1 categoria** (classificação)

---

### 10. **MANAGER_PROFILE** (Dados Enriquecidos)

**Definição**: Perfil estendido de gestor com métricas e preferências

**Atributos**:
- `id` (PK)
- `usuarioId` (FK): Referência ao Gestor
- `displayName`: Nome para exibição
- `initials`: Iniciais para avatar
- `avatarUrl`: URL da foto
- `departamento`: Setor (ex: "Manutenção")
- `stats.managedTickets`: Total de chamados geridos
- `stats.avgResolutionHours`: Média de horas para resolver
- `stats.slaCompliancePct`: % de cumprimento SLA
- `notificationPreferences[]`: Preferências (email, sistema, etc)

**Relacionamentos**:
- **1 manager_profile : 1 gestor** (FK: usuarioId, unique)
- **1 manager_profile : N notification_preferences**

---

### 11. **NOTIFICATION_PREFERENCE** (Configurações de Contato)

**Definição**: Preferências de como o usuário quer ser notificado

**Atributos**:
- `id` (PK)
- `managerProfileId` (FK)
- `label`: Tipo de evento (ex: "Novo Chamado")
- `email`: Notificar por e-mail? (booleano)
- `sistema`: Notificar no sistema? (booleano)

---

## 🔗 Diagrama Conceitual (Narrativo)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  USUARIOS (Abstrata)                                             │
│  ├─ CIDADÃO: reporta problemas                                  │
│  ├─ GESTOR: resolve problemas                                   │
│  └─ ADMIN: administra sistema                                   │
│                                                                  │
└─────────────┬──────────────────────────────────────────────────┘
              │
              │ CIDADÃO reporta  │  GESTOR gerencia
              ├─────────────────→ CHAMADO ←─────────────┐
              │                   └─────┬─────┘          │
              │                         │                │
              │      roteado via   ┌────▼────┐      atribuído
              │                    │  REGRA   │       para
              │              ┌────→COMPE-    │◄──────────┐
              │              │     TÊNCIA    │           │
              │              │     └─────────┘           │
              │              │           │               │
              │              │     determinaorgaoId      │
              │              │           │               │
    gera evento              │      ┌────▼────┐     ÓRGÃO
    para              ┌──────┴──────→│  ÓRGÃO  │◄─────────┘
    ┌────────┐        │              │ Principal│
    │NOTIF.  │◄───────┘              │ Secundário
    │        │                       └─────────┘
    │        │                            │
    └────────┘                       emprega GESTOR
         │                                │
         │ direcionada para          MANAGER_PROFILE
         │                                │
    ┌────▼─────┐                  notification_prefs
    │ USUARIO  │
    └──────────┘

    TIMELINE_EVENT (imutável)
         │
         └─ rastreia cada mudança de CHAMADO
```

---

## 📊 Resumo de Relacionamentos

| Origem | Destino | Cardinality | Tipo | Exemplo |
|--------|---------|-------------|------|---------|
| Cidadão | Chamado | 1:N | Reporta | João cria 3 chamados |
| Gestor | Chamado | 1:N | Gerencia | Maria atribui-se a 5 chamados |
| Órgão | Gestor | 1:N | Emprega | PMR tem 20 gestores |
| Órgão | Chamado | 1:N | Responsável | PMR resolve 100 chamados/mês |
| Chamado | Timeline | 1:N | Auditoria | 1 chamado → 10 eventos |
| Chamado | Notificação | 1:N | Gera | 1 chamado → 3 notificações |
| Usuário | Notificação | 1:N | Recebe | 1 usuário → 100 notificações |
| Categoria | RegrasCompetência | 1:N | Roteia | Via → 3 regras diferentes |
| RegrasCompetência | Órgão | N:1 | Designa | Regra → PMR (principal) |

---

## ✅ Constraints Transversais

1. **Workflow Válido**: Chamado.status respeita transições permitidas
2. **Segregação de Perfis**: Um usuário = APENAS um perfil (Cidadão OU Gestor OU Admin)
3. **SLA Dinâmico**: slaDeadline recalculado quando categoria/órgão muda
4. **Imutabilidade de Auditoria**: Timeline_events nunca são deletados/modificados
5. **Isolamento de Órgão**: Gestor só vê chamados de seu órgão (aplicação)
6. **Roteamento Determinístico**: Mesma categoria/subcategoria → sempre mesmo órgão
7. **Cascata de Exclusão**: Deletar Órgão → todos seus Chamados devem ser reatribuídos primeiro

---

## 📋 Próximas Fases

- ✅ **Modelo Conceitual** (ESTE DOCUMENTO)
- ⏭️ **Modelo Lógico** (Diagrama ER em Mermaid.js)
- ⏭️ **Modelo Físico** (Scripts DDL com 3FN)

---

**Documento Criado**: `2_MODELO_CONCEITUAL.md`

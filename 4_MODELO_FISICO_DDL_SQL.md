# Modelo Físico - Scripts DDL
## Sistema de Gerenciamento de Chamados Públicos (Prefeitura)

---

## 🛠️ Objetivo

Este documento contém os scripts SQL (DDL - Data Definition Language) para implementar o banco de dados PostgreSQL, aplicando:
- ✅ 3ª Forma Normal (3FN)
- ✅ Chaves Primárias e Estrangeiras
- ✅ Constraints de Integridade
- ✅ Índices Otimizados
- ✅ Triggers para Auditoria
- ✅ Stored Procedures

**Sistema**: PostgreSQL 14+

---

## 📋 Índice de Seções

1. [Extensões e Configurações](#extensões-e-configurações)
2. [Enumeradores (ENUMs)](#enumeradores-enums)
3. [Tabelas Base](#tabelas-base)
4. [Tabelas de Referência](#tabelas-de-referência)
5. [Triggers](#triggers)
6. [Índices](#índices)
7. [Stored Procedures](#stored-procedures)
8. [Dados Iniciais](#dados-iniciais)
9. [Exemplos de Queries](#exemplos-de-queries)

---

## 🔧 Extensões e Configurações

```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensão para JSON
CREATE EXTENSION IF NOT EXISTS "jsonb";

-- Definir Timezone
SET timezone = 'America/Recife';

-- Definir encoding
SET client_encoding = 'UTF8';
```

---

## 📌 Enumeradores (ENUMs)

```sql
-- Perfis de Usuário
CREATE TYPE PERFIL AS ENUM ('Cidadão', 'Gestor', 'Admin');

-- Status de Usuário/Órgão
CREATE TYPE STATUS_ENUM AS ENUM ('Ativo', 'Inativo');

-- Status de Chamado (workflow)
CREATE TYPE STATUS_CHAMADO AS ENUM (
    'Aberto',
    'Em Análise',
    'Em Andamento',
    'Aguardando',
    'Resolvido',
    'Fechado'
);

-- Prioridade
CREATE TYPE PRIORIDADE AS ENUM ('Baixa', 'Média', 'Alta', 'Crítica');

-- Tipo de Órgão
CREATE TYPE TIPO_ORGAO AS ENUM ('Municipal', 'Estadual', 'Federal', 'Concessionária');

-- Tipo de Timeline Event
CREATE TYPE TIPO_TIMELINE AS ENUM ('criacao', 'status', 'mensagem', 'transferencia', 'conclusao');

-- Tipo de Notificação
CREATE TYPE TIPO_NOTIFICACAO AS ENUM (
    'chamado',
    'status',
    'equipe',
    'concluido',
    'chamado-registrado',
    'status-atualizado',
    'equipe-designada',
    'chamado-concluido'
);
```

---

## 🏛️ Tabelas Base

### **1. Tabela USUARIO**

```sql
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil PERFIL NOT NULL,
    status STATUS_ENUM NOT NULL DEFAULT 'Ativo',
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    atualizadoPor UUID,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~ '^\w+@\w+\.\w+$'),
    CONSTRAINT senha_min_length CHECK (LENGTH(senha) >= 8),
    
    -- Índices implícitos (PK, UNIQUE)
    -- Adicional
    CONSTRAINT self_reference_check CHECK (atualizadoPor != id OR atualizadoPor IS NULL)
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_perfil ON usuario(perfil);
CREATE INDEX idx_usuario_status ON usuario(status);
CREATE INDEX idx_usuario_criadoEm ON usuario(criadoEm DESC);

-- Tabela de auditoria de usuário
CREATE TABLE usuario_audit (
    id SERIAL PRIMARY KEY,
    usuarioId UUID NOT NULL REFERENCES usuario(id),
    acao VARCHAR(50) NOT NULL,
    dadosAntigos JSONB,
    dadosNovos JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### **2. Tabela CIDADAO (Herança/Especialização)**

```sql
CREATE TABLE cidadao (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    cpf VARCHAR(11) UNIQUE,
    endereco VARCHAR(255),
    
    CONSTRAINT cpf_format CHECK (cpf ~ '^\d{11}$' OR cpf IS NULL),
    CONSTRAINT perfil_cidadao CHECK (
        -- Validar que usuario vinculado é Cidadão
        -- (verificar em trigger)
    )
);

CREATE INDEX idx_cidadao_cpf ON cidadao(cpf) WHERE cpf IS NOT NULL;
```

---

### **3. Tabela ORGAO**

```sql
CREATE TABLE orgao (
    id VARCHAR(10) PRIMARY KEY,  -- Sigla como PK
    nome VARCHAR(200) NOT NULL UNIQUE,
    sigla VARCHAR(10) NOT NULL UNIQUE,
    tipo TIPO_ORGAO NOT NULL,
    slaHoras INTEGER NOT NULL CHECK (slaHoras > 0),
    responsavel VARCHAR(150),
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    status STATUS_ENUM NOT NULL DEFAULT 'Ativo',
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT orgao_email_format CHECK (email ~ '^\w+@\w+\.\w+$')
);

CREATE INDEX idx_orgao_sigla ON orgao(sigla);
CREATE INDEX idx_orgao_status ON orgao(status);
CREATE INDEX idx_orgao_tipo ON orgao(tipo);
```

---

### **4. Tabela GESTOR (Herança)**

```sql
CREATE TABLE gestor (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    orgaoId VARCHAR(10) NOT NULL REFERENCES orgao(id) ON DELETE RESTRICT,
    departamento VARCHAR(100),
    telefone VARCHAR(20),
    
    CONSTRAINT perfil_gestor CHECK (
        -- Validar que usuario vinculado é Gestor (em trigger)
    )
);

CREATE INDEX idx_gestor_orgao ON gestor(orgaoId);
```

---

### **5. Tabela ADMIN (Herança)**

```sql
CREATE TABLE admin (
    id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE
    
    -- CONSTRAINT: usuario.perfil = 'Admin' (via trigger)
);
```

---

### **6. Tabela CATEGORIA**

```sql
CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT nome_not_empty CHECK (LENGTH(TRIM(nome)) > 0)
);

-- Inserir categorias padrão (vide seção de dados iniciais)

CREATE INDEX idx_categoria_nome ON categoria(nome);
CREATE INDEX idx_categoria_ativo ON categoria(ativo);
```

---

### **7. Tabela REGRA_COMPETENCIA**

```sql
CREATE TABLE regra_competencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoriaId INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    subcategoria VARCHAR(100) NOT NULL,
    orgaoPrincipalId VARCHAR(10) NOT NULL REFERENCES orgao(id) ON DELETE RESTRICT,
    orgaoSecundarioId VARCHAR(10) REFERENCES orgao(id) ON DELETE SET NULL,
    slaHoras INTEGER NOT NULL CHECK (slaHoras > 0),
    prioridade PRIORIDADE NOT NULL DEFAULT 'Média',
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT categoria_subcategoria_unica UNIQUE (categoriaId, subcategoria),
    CONSTRAINT orgaos_diferentes CHECK (
        orgaoPrincipalId != orgaoSecundarioId OR orgaoSecundarioId IS NULL
    ),
    CONSTRAINT subcategoria_not_empty CHECK (LENGTH(TRIM(subcategoria)) > 0)
);

CREATE INDEX idx_regra_categoria ON regra_competencia(categoriaId);
CREATE INDEX idx_regra_orgao_principal ON regra_competencia(orgaoPrincipalId);
CREATE INDEX idx_regra_orgao_secundario ON regra_competencia(orgaoSecundarioId) WHERE orgaoSecundarioId IS NOT NULL;
CREATE INDEX idx_regra_categoria_sub ON regra_competencia(categoriaId, subcategoria);
```

---

### **8. Tabela CHAMADO (Central)**

```sql
CREATE TABLE chamado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocolo VARCHAR(20) NOT NULL UNIQUE,
    descricao TEXT NOT NULL CHECK (LENGTH(TRIM(descricao)) > 0),
    
    -- Foreign Keys
    cidadaoId UUID NOT NULL REFERENCES cidadao(id) ON DELETE CASCADE,
    gestorId UUID REFERENCES gestor(id) ON DELETE SET NULL,
    orgaoId VARCHAR(10) NOT NULL REFERENCES orgao(id) ON DELETE RESTRICT,
    categoriaId INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    
    -- Classificação
    subcategoria VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    
    -- Status e Prioridade
    status STATUS_CHAMADO NOT NULL DEFAULT 'Aberto',
    prioridade PRIORIDADE NOT NULL,
    
    -- Mídia
    fotoUrl VARCHAR(500),
    
    -- SLA
    slaHoras INTEGER NOT NULL CHECK (slaHoras > 0),
    slaDeadline TIMESTAMP NOT NULL,
    slaEncerradoHa DECIMAL(8, 2),
    slaJustification TEXT,
    
    -- Resolução
    resolutionNote TEXT,
    resolutionPhotoUrl VARCHAR(500),
    
    -- Auditoria
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT foto_url_format CHECK (fotoUrl IS NULL OR fotoUrl ~ '^https?://'),
    CONSTRAINT resolution_photo_format CHECK (resolutionPhotoUrl IS NULL OR resolutionPhotoUrl ~ '^https?://'),
    CONSTRAINT resolucao_obrigatoria CHECK (
        status NOT IN ('Resolvido', 'Fechado') OR (resolutionNote IS NOT NULL AND LENGTH(TRIM(resolutionNote)) > 0)
    ),
    CONSTRAINT sla_encerrado_positivo CHECK (slaEncerradoHa IS NULL OR slaEncerradoHa >= 0),
    CONSTRAINT coordenadas_validas CHECK (
        (latitude != 0 OR longitude != 0) OR endereco IS NOT NULL
    )
);

-- Índices Críticos de Consulta
CREATE INDEX idx_chamado_protocolo ON chamado(protocolo);
CREATE INDEX idx_chamado_cidadao ON chamado(cidadaoId, criadoEm DESC);
CREATE INDEX idx_chamado_gestor ON chamado(gestorId, status, criadoEm DESC) WHERE gestorId IS NOT NULL;
CREATE INDEX idx_chamado_orgao ON chamado(orgaoId, status, criadoEm DESC);
CREATE INDEX idx_chamado_status ON chamado(status, criadoEm DESC);
CREATE INDEX idx_chamado_sla ON chamado(slaDeadline, status) WHERE status IN ('Aberto', 'Em Análise', 'Em Andamento', 'Aguardando');
CREATE INDEX idx_chamado_categoria ON chamado(categoriaId);
CREATE INDEX idx_chamado_criadoEm ON chamado(criadoEm DESC);
CREATE INDEX idx_chamado_prioridade ON chamado(prioridade);

-- Índices Compostos para Queries Frequentes
CREATE INDEX idx_chamado_gestor_status_recentes ON chamado(gestorId, status, criadoEm DESC);
CREATE INDEX idx_chamado_orgao_sla_vencido ON chamado(orgaoId, slaDeadline, status);
```

---

### **9. Tabela TIMELINE_EVENT (Auditoria Imutável)**

```sql
CREATE TABLE timeline_event (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chamadoId UUID NOT NULL REFERENCES chamado(id) ON DELETE CASCADE,
    tipo TIPO_TIMELINE NOT NULL,
    titulo VARCHAR(200),
    descricao TEXT NOT NULL,
    autor VARCHAR(150) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Dados de contexto (JSON para flexibilidade)
    dadosAntigos JSONB,
    dadosNovos JSONB,
    
    CONSTRAINT descricao_not_empty CHECK (LENGTH(TRIM(descricao)) > 0),
    CONSTRAINT autor_not_empty CHECK (LENGTH(TRIM(autor)) > 0)
);

-- Índices para Auditoria
CREATE INDEX idx_timeline_chamado ON timeline_event(chamadoId);
CREATE INDEX idx_timeline_chamado_desc ON timeline_event(chamadoId, timestamp DESC);
CREATE INDEX idx_timeline_timestamp ON timeline_event(timestamp DESC);
CREATE INDEX idx_timeline_tipo ON timeline_event(tipo);

-- Constraint de Imutabilidade (ver Triggers)
```

---

### **10. Tabela NOTIFICACAO**

```sql
CREATE TABLE notificacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuarioId UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TIPO_NOTIFICACAO NOT NULL,
    chamadoId UUID REFERENCES chamado(id) ON DELETE CASCADE,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lida_em TIMESTAMP,
    
    CONSTRAINT titulo_not_empty CHECK (LENGTH(TRIM(titulo)) > 0),
    CONSTRAINT mensagem_not_empty CHECK (LENGTH(TRIM(mensagem)) > 0),
    CONSTRAINT lida_em_logic CHECK (
        (lida = TRUE AND lida_em IS NOT NULL) OR (lida = FALSE AND lida_em IS NULL)
    )
);

-- Índices para Notificações
CREATE INDEX idx_notificacao_usuario ON notificacao(usuarioId);
CREATE INDEX idx_notificacao_usuario_lida ON notificacao(usuarioId, lida, criadoEm DESC);
CREATE INDEX idx_notificacao_lida ON notificacao(lida);
CREATE INDEX idx_notificacao_chamado ON notificacao(chamadoId) WHERE chamadoId IS NOT NULL;
CREATE INDEX idx_notificacao_criadoEm ON notificacao(criadoEm DESC);
```

---

### **11. Tabela MANAGER_PROFILE**

```sql
CREATE TABLE manager_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuarioId UUID NOT NULL UNIQUE REFERENCES gestor(id) ON DELETE CASCADE,
    displayName VARCHAR(150) NOT NULL,
    initials VARCHAR(4) NOT NULL,
    avatarUrl VARCHAR(500),
    departamento VARCHAR(100),
    managedTickets INTEGER NOT NULL DEFAULT 0 CHECK (managedTickets >= 0),
    avgResolutionHours DECIMAL(8, 2) NOT NULL DEFAULT 0 CHECK (avgResolutionHours >= 0),
    slaCompliancePct DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (slaCompliancePct >= 0 AND slaCompliancePct <= 100),
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manager_profile_usuario ON manager_profile(usuarioId);
CREATE INDEX idx_manager_profile_sla ON manager_profile(slaCompliancePct DESC);
```

---

### **12. Tabela NOTIFICATION_PREFERENCE**

```sql
CREATE TABLE notification_preference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    managerProfileId UUID NOT NULL REFERENCES manager_profile(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    email BOOLEAN NOT NULL DEFAULT TRUE,
    sistema BOOLEAN NOT NULL DEFAULT TRUE,
    criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT label_not_empty CHECK (LENGTH(TRIM(label)) > 0),
    CONSTRAINT at_least_one_canal CHECK (email = TRUE OR sistema = TRUE)
);

CREATE INDEX idx_notif_pref_manager ON notification_preference(managerProfileId);
```

---

### **13. Tabela Associativa: ORGAO_CATEGORIA**

```sql
CREATE TABLE orgao_categoria (
    orgaoId VARCHAR(10) NOT NULL REFERENCES orgao(id) ON DELETE CASCADE,
    categoriaId INTEGER NOT NULL REFERENCES categoria(id) ON DELETE CASCADE,
    
    PRIMARY KEY (orgaoId, categoriaId)
);

CREATE INDEX idx_orgao_categoria_categoria ON orgao_categoria(categoriaId);
```

---

## 🔔 Triggers

### **1. Trigger: Validar Transição de Status (Workflow)**

```sql
CREATE FUNCTION validar_transicao_status()
RETURNS TRIGGER AS $$
DECLARE
    transicoes_validas JSONB := '{
        "Aberto": ["Em Análise", "Fechado"],
        "Em Análise": ["Em Andamento", "Aguardando", "Aberto"],
        "Em Andamento": ["Aguardando", "Resolvido", "Em Análise"],
        "Aguardando": ["Em Andamento", "Resolvido"],
        "Resolvido": ["Fechado"],
        "Fechado": []
    }'::JSONB;
    status_novo TEXT := NEW.status::TEXT;
    status_atual TEXT := OLD.status::TEXT;
BEGIN
    IF NEW.status != OLD.status THEN
        -- Validar se transição é permitida
        IF NOT (transicoes_validas->>status_atual)::TEXT ~ status_novo THEN
            RAISE EXCEPTION 'Transição inválida de % para %', status_atual, status_novo;
        END IF;
        
        -- Se Status = "Resolvido" ou "Fechado", resolutionNote é obrigatório
        IF NEW.status IN ('Resolvido', 'Fechado') AND (NEW.resolutionNote IS NULL OR TRIM(NEW.resolutionNote) = '') THEN
            RAISE EXCEPTION 'resolutionNote é obrigatório para status "%"', NEW.status;
        END IF;
        
        -- Criar Timeline Event para mudança de status
        INSERT INTO timeline_event (
            chamadoId, tipo, titulo, descricao, autor, timestamp,
            dadosAntigos, dadosNovos
        ) VALUES (
            NEW.id,
            'status',
            'Status alterado',
            FORMAT('De "%s" para "%s"', status_atual, status_novo),
            COALESCE(CURRENT_USER, 'sistema'),
            CURRENT_TIMESTAMP,
            jsonb_build_object('status', status_atual),
            jsonb_build_object('status', status_novo)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_status_chamado
BEFORE UPDATE ON chamado
FOR EACH ROW
EXECUTE FUNCTION validar_transicao_status();
```

---

### **2. Trigger: Imutabilidade de Timeline**

```sql
CREATE FUNCTION garantir_imutabilidade_timeline()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Timeline events não podem ser modificados ou deletados. ID: %', OLD.id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_timeline_imutavel_update
BEFORE UPDATE ON timeline_event
FOR EACH ROW
EXECUTE FUNCTION garantir_imutabilidade_timeline();

CREATE TRIGGER tr_timeline_imutavel_delete
BEFORE DELETE ON timeline_event
FOR EACH ROW
EXECUTE FUNCTION garantir_imutabilidade_timeline();
```

---

### **3. Trigger: Auto-gerar Protocolo ao Criar Chamado**

```sql
CREATE SEQUENCE seq_chamado_numero START 1000;

CREATE FUNCTION gerar_protocolo_chamado()
RETURNS TRIGGER AS $$
DECLARE
    ano SMALLINT;
    numero INTEGER;
BEGIN
    IF NEW.protocolo IS NULL OR TRIM(NEW.protocolo) = '' THEN
        ano := EXTRACT(YEAR FROM CURRENT_DATE)::SMALLINT;
        numero := NEXTVAL('seq_chamado_numero');
        NEW.protocolo := FORMAT('SCH-%s-%s', ano, LPAD(numero::TEXT, 5, '0'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_gerar_protocolo
BEFORE INSERT ON chamado
FOR EACH ROW
EXECUTE FUNCTION gerar_protocolo_chamado();
```

---

### **4. Trigger: Calcular SLA Deadline**

```sql
CREATE FUNCTION calcular_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    -- Se slaHoras mudou ou é primeira vez
    IF (TG_OP = 'INSERT') OR (NEW.slaHoras != OLD.slaHoras) THEN
        NEW.slaDeadline := NEW.criadoEm + (NEW.slaHoras || ' hours')::INTERVAL;
    END IF;
    
    -- Se status muda para Resolvido/Fechado, calcular slaEncerradoHa
    IF TG_OP = 'UPDATE' AND NEW.status IN ('Resolvido', 'Fechado') THEN
        IF CURRENT_TIMESTAMP > NEW.slaDeadline THEN
            NEW.slaEncerradoHa := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.slaDeadline)) / 3600.0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calcular_sla
BEFORE INSERT OR UPDATE ON chamado
FOR EACH ROW
EXECUTE FUNCTION calcular_sla_deadline();
```

---

### **5. Trigger: Validar Perfil na Especialização**

```sql
CREATE FUNCTION validar_perfil_especializado()
RETURNS TRIGGER AS $$
DECLARE
    perfil_usuario PERFIL;
BEGIN
    SELECT u.perfil INTO perfil_usuario FROM usuario u WHERE u.id = NEW.id;
    
    -- Verifica qual tabela está sendo inserida e valida o perfil
    IF TG_ARGV[0] = 'cidadao' THEN
        IF perfil_usuario != 'Cidadão' THEN
            RAISE EXCEPTION 'Usuário com ID % não é Cidadão', NEW.id;
        END IF;
    ELSIF TG_ARGV[0] = 'gestor' THEN
        IF perfil_usuario != 'Gestor' THEN
            RAISE EXCEPTION 'Usuário com ID % não é Gestor', NEW.id;
        END IF;
    ELSIF TG_ARGV[0] = 'admin' THEN
        IF perfil_usuario != 'Admin' THEN
            RAISE EXCEPTION 'Usuário com ID % não é Admin', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_cidadao
BEFORE INSERT ON cidadao
FOR EACH ROW
EXECUTE FUNCTION validar_perfil_especializado('cidadao');

CREATE TRIGGER tr_validar_gestor
BEFORE INSERT ON gestor
FOR EACH ROW
EXECUTE FUNCTION validar_perfil_especializado('gestor');

CREATE TRIGGER tr_validar_admin
BEFORE INSERT ON admin
FOR EACH ROW
EXECUTE FUNCTION validar_perfil_especializado('admin');
```

---

### **6. Trigger: Atualizar atualizadoEm**

```sql
CREATE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizadoEm := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_atualizar_timestamp_usuario
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_atualizar_timestamp_orgao
BEFORE UPDATE ON orgao
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_atualizar_timestamp_chamado
BEFORE UPDATE ON chamado
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_atualizar_timestamp_manager_profile
BEFORE UPDATE ON manager_profile
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 📑 Índices Estratégicos

```sql
-- Índices de Desempenho (Já criados nas definições de tabela)
-- Aqui estão os índices COMPOSTOS e ESPECIALIZADOS adicionais

-- Index para Fila de Gestores (Query mais crítica)
CREATE INDEX idx_fila_gestor ON chamado(gestorId, status, criadoEm DESC)
    WHERE gestorId IS NOT NULL AND status IN ('Aberto', 'Em Análise');

-- Index para Alertas de SLA
CREATE INDEX idx_sla_vencido ON chamado(orgaoId, slaDeadline)
    WHERE status NOT IN ('Resolvido', 'Fechado') AND slaDeadline < CURRENT_TIMESTAMP;

-- Index para Dashboard de Órgão
CREATE INDEX idx_dashboard_orgao ON chamado(orgaoId, criadoEm DESC, status);

-- Index para Relatórios de Resolução
CREATE INDEX idx_relatorio_resolucao ON chamado(orgaoId, status, atualizadoEm DESC)
    WHERE status IN ('Resolvido', 'Fechado');

-- Index para Notificações Não Lidas (Query em tempo real)
CREATE INDEX idx_notif_nao_lida ON notificacao(usuarioId, lida, criadoEm DESC)
    WHERE lida = FALSE;

-- Index para Busca por Localização (GIS - Geographic)
CREATE INDEX idx_chamado_localizacao ON chamado
    USING GIST (ll_to_earth(latitude, longitude))
    WHERE status NOT IN ('Resolvido', 'Fechado');
```

---

## ⚙️ Stored Procedures

### **1. Procedure: Atribuir Chamado a Gestor**

```sql
CREATE PROCEDURE atribuir_chamado_a_gestor(
    p_chamado_id UUID,
    p_gestor_id UUID,
    p_usuario_atual UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_chamado RECORD;
    v_orgao_gestor VARCHAR(10);
BEGIN
    -- Iniciar transação
    START TRANSACTION;
    
    -- Validar Chamado
    SELECT * INTO v_chamado FROM chamado WHERE id = p_chamado_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chamado não encontrado: %', p_chamado_id;
    END IF;
    
    -- Validar Gestor existe e pertence ao órgão correto
    SELECT orgaoId INTO v_orgao_gestor FROM gestor WHERE id = p_gestor_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gestor não encontrado: %', p_gestor_id;
    END IF;
    IF v_orgao_gestor != v_chamado.orgaoId THEN
        RAISE EXCEPTION 'Gestor não pertence ao órgão responsável do chamado';
    END IF;
    
    -- Atualizar Chamado
    UPDATE chamado SET
        gestorId = p_gestor_id,
        status = 'Em Análise'
    WHERE id = p_chamado_id;
    
    -- Timeline será auto-gerada via Trigger
    
    -- Criar Notificação para Gestor
    INSERT INTO notificacao (usuarioId, titulo, mensagem, tipo, chamadoId)
    VALUES (
        p_gestor_id,
        'Novo Chamado Atribuído',
        'Você foi atribuído ao chamado ' || v_chamado.protocolo,
        'equipe-designada',
        p_chamado_id
    );
    
    COMMIT;
END;
$$;
```

---

### **2. Procedure: Fechar Chamado com Resolução**

```sql
CREATE PROCEDURE fechar_chamado(
    p_chamado_id UUID,
    p_resolution_note TEXT,
    p_resolution_photo_url VARCHAR,
    p_usuario_atual UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_chamado RECORD;
BEGIN
    START TRANSACTION;
    
    SELECT * INTO v_chamado FROM chamado WHERE id = p_chamado_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chamado não encontrado';
    END IF;
    
    IF v_chamado.status = 'Fechado' THEN
        RAISE EXCEPTION 'Chamado já está fechado';
    END IF;
    
    UPDATE chamado SET
        status = 'Resolvido',
        resolutionNote = p_resolution_note,
        resolutionPhotoUrl = p_resolution_photo_url
    WHERE id = p_chamado_id;
    
    -- Timeline será gerada via Trigger
    
    -- Notificar Cidadão
    INSERT INTO notificacao (usuarioId, titulo, mensagem, tipo, chamadoId)
    SELECT
        c.id,
        'Chamado Resolvido',
        'Seu chamado ' || v_chamado.protocolo || ' foi resolvido',
        'chamado-concluido',
        p_chamado_id
    FROM cidadao c WHERE c.id = v_chamado.cidadaoId;
    
    COMMIT;
END;
$$;
```

---

### **3. Procedure: Gerar Relatório de SLA**

```sql
CREATE PROCEDURE relatorio_sla(
    p_orgao_id VARCHAR,
    p_data_inicio DATE,
    p_data_fim DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.sigla,
        COUNT(*) AS total_chamados,
        COUNT(*) FILTER (WHERE c.atualizadoEm > c.slaDeadline) AS vencidos,
        ROUND(
            COUNT(*) FILTER (WHERE c.atualizadoEm > c.slaDeadline)::NUMERIC / COUNT(*) * 100,
            2
        ) AS pct_vencimento,
        ROUND(AVG(EXTRACT(EPOCH FROM (c.atualizadoEm - c.criadoEm)) / 3600), 2) AS media_horas_resolucao
    FROM chamado c
    JOIN orgao o ON c.orgaoId = o.id
    WHERE
        c.orgaoId = p_orgao_id
        AND DATE(c.criadoEm) >= p_data_inicio
        AND DATE(c.criadoEm) <= p_data_fim
        AND c.status IN ('Resolvido', 'Fechado')
    GROUP BY o.id, o.sigla;
END;
$$;
```

---

## 📊 Dados Iniciais

### **1. Inserir Categorias**

```sql
INSERT INTO categoria (nome, descricao, ativo) VALUES
('Problemas na Via', 'Ruas com buracos, pavimentação danificada, defeitos estruturais', TRUE),
('Água e Esgoto', 'Vazamentos de água, entupimentos, problemas de saneamento', TRUE),
('Iluminação Pública', 'Lâmpadas queimadas, postes danificados, falta de iluminação', TRUE),
('Saneamento Básico', 'Coleta de lixo, limpeza, higiene pública', TRUE),
('Sinalização', 'Placas de trânsito, demarcação, sinalizações', TRUE),
('Outros Problemas', 'Problemas não categorizados', TRUE);
```

---

### **2. Inserir Órgãos**

```sql
INSERT INTO orgao (id, nome, sigla, tipo, slaHoras, responsavel, email, status) VALUES
('PMR', 'Prefeitura Municipal do Recife', 'PMR', 'Municipal', 48, 'Prefeito', 'contato@pmr.gov.br', 'Ativo'),
('GOPE', 'Gerência de Obras Públicas e Espaços', 'GOPE', 'Municipal', 72, 'Gerente', 'contato@gope.gov.br', 'Ativo'),
('COMPESA', 'Companhia Pernambucana de Saneamento', 'COMPESA', 'Concessionária', 36, 'Gerente Regional', 'contato@compesa.com.br', 'Ativo'),
('ENERGISA', 'Energisa Pernambuco', 'ENERGISA', 'Concessionária', 24, 'Gerente', 'contato@energisa.com.br', 'Ativo'),
('DETRAN', 'Departamento Estadual de Trânsito', 'DETRAN-PE', 'Estadual', 48, 'Superintendente', 'contato@detran.pe.gov.br', 'Ativo');
```

---

### **3. Inserir Regras de Competência**

```sql
-- PMR: Problemas na Via e Sinalização
INSERT INTO regra_competencia (categoriaId, subcategoria, orgaoPrincipalId, slaHoras, prioridade) VALUES
((SELECT id FROM categoria WHERE nome = 'Problemas na Via'), 'Buraco', 'PMR', 48, 'Média'),
((SELECT id FROM categoria WHERE nome = 'Problemas na Via'), 'Pavimentação', 'PMR', 72, 'Baixa'),
((SELECT id FROM categoria WHERE nome = 'Sinalização'), 'Placa Danificada', 'PMR', 48, 'Média');

-- COMPESA: Água e Esgoto
INSERT INTO regra_competencia (categoriaId, subcategoria, orgaoPrincipalId, slaHoras, prioridade) VALUES
((SELECT id FROM categoria WHERE nome = 'Água e Esgoto'), 'Vazamento', 'COMPESA', 36, 'Média'),
((SELECT id FROM categoria WHERE nome = 'Água e Esgoto'), 'Entupimento', 'COMPESA', 48, 'Média');

-- ENERGISA: Iluminação
INSERT INTO regra_competencia (categoriaId, subcategoria, orgaoPrincipalId, slaHoras, prioridade) VALUES
((SELECT id FROM categoria WHERE nome = 'Iluminação Pública'), 'Lâmpada Queimada', 'ENERGISA', 24, 'Média'),
((SELECT id FROM categoria WHERE nome = 'Iluminação Pública'), 'Poste Danificado', 'ENERGISA', 48, 'Alta');

-- GOPE: Saneamento
INSERT INTO regra_competencia (categoriaId, subcategoria, orgaoPrincipalId, orgaoSecundarioId, slaHoras, prioridade) VALUES
((SELECT id FROM categoria WHERE nome = 'Saneamento Básico'), 'Limpeza', 'GOPE', NULL, 72, 'Baixa');
```

---

### **4. Inserir Órgão-Categoria (Many-to-Many)**

```sql
INSERT INTO orgao_categoria (orgaoId, categoriaId)
SELECT 'PMR', id FROM categoria WHERE nome IN ('Problemas na Via', 'Sinalização')
UNION ALL
SELECT 'COMPESA', id FROM categoria WHERE nome = 'Água e Esgoto'
UNION ALL
SELECT 'ENERGISA', id FROM categoria WHERE nome = 'Iluminação Pública'
UNION ALL
SELECT 'GOPE', id FROM categoria WHERE nome = 'Saneamento Básico';
```

---

## 🔍 Exemplos de Queries Críticas

### **1. Fila de Chamados do Gestor**

```sql
-- Tickets não atribuídos, agrupados por urgência
SELECT 
    c.id,
    c.protocolo,
    c.descricao,
    c.endereco,
    c.prioridade,
    c.criadoEm,
    CASE 
        WHEN CURRENT_TIMESTAMP > c.slaDeadline THEN 'VENCIDO'
        WHEN CURRENT_TIMESTAMP > (c.slaDeadline - INTERVAL '4 hours') THEN 'CRÍTICO'
        ELSE 'OK'
    END AS sla_status,
    EXTRACT(EPOCH FROM (c.slaDeadline - CURRENT_TIMESTAMP)) / 3600 AS horas_restantes
FROM chamado c
WHERE 
    c.gestorId = 'ID_GESTOR'
    AND c.status IN ('Aberto', 'Em Análise')
ORDER BY 
    c.prioridade DESC,
    c.criadoEm ASC
LIMIT 20;
```

---

### **2. Relatório SLA por Órgão**

```sql
SELECT
    o.sigla,
    o.nome,
    COUNT(*) AS total_chamados,
    COUNT(*) FILTER (WHERE c.status IN ('Resolvido', 'Fechado')) AS resolvidos,
    COUNT(*) FILTER (WHERE c.atualizadoEm > c.slaDeadline) AS vencidos,
    ROUND(
        COUNT(*) FILTER (WHERE c.atualizadoEm <= c.slaDeadline)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100,
        2
    ) AS pct_cumprimento_sla,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (c.atualizadoEm - c.criadoEm)) / 3600)::NUMERIC,
        2
    ) AS media_horas_resolucao
FROM chamado c
JOIN orgao o ON c.orgaoId = o.id
WHERE DATE(c.criadoEm) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY o.id, o.sigla, o.nome
ORDER BY pct_cumprimento_sla ASC;
```

---

### **3. Alertas de SLA Vencido**

```sql
SELECT
    c.protocolo,
    o.sigla,
    c.descricao,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.slaDeadline)) / 3600, 2) AS horas_atrasado,
    c.gestor_nome,
    c.prioridade
FROM chamado c
JOIN orgao o ON c.orgaoId = o.id
LEFT JOIN gestor g ON c.gestorId = g.id
LEFT JOIN usuario u ON g.id = u.id
WHERE
    c.status NOT IN ('Resolvido', 'Fechado')
    AND CURRENT_TIMESTAMP > c.slaDeadline
ORDER BY horas_atrasado DESC;
```

---

### **4. Dashboard Gestor (Métricas)**

```sql
SELECT
    u.nome,
    mp.slaCompliancePct,
    COUNT(c.id) AS chamados_gerenciados,
    COUNT(c.id) FILTER (WHERE c.status != 'Fechado') AS abertos,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (c.atualizadoEm - c.criadoEm)) / 3600)::NUMERIC,
        2
    ) AS media_horas_resolucao,
    COUNT(c.id) FILTER (WHERE c.status = 'Resolvido') AS resolvidos_mes
FROM usuario u
JOIN gestor g ON u.id = g.id
LEFT JOIN manager_profile mp ON g.id = mp.usuarioId
LEFT JOIN chamado c ON g.id = c.gestorId
    AND c.criadoEm >= DATE_TRUNC('month', CURRENT_DATE)
WHERE u.perfil = 'Gestor' AND u.status = 'Ativo'
GROUP BY u.id, u.nome, mp.slaCompliancePct
ORDER BY mp.slaCompliancePct ASC;
```

---

### **5. Notificações Pendentes do Usuário**

```sql
SELECT
    id,
    titulo,
    mensagem,
    tipo,
    chamadoId,
    criadoEm,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - criadoEm)) / 3600 AS horas_atrasado
FROM notificacao
WHERE
    usuarioId = 'ID_USUARIO'
    AND lida = FALSE
    AND criadoEm >= CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY criadoEm DESC
LIMIT 50;
```

---

### **6. Localizar Chamados Próximos (GIS)**

```sql
-- Encontrar chamados a menos de 1 km de uma coordenada
SELECT
    c.id,
    c.protocolo,
    c.descricao,
    c.latitude,
    c.longitude,
    earth_distance(
        ll_to_earth(c.latitude, c.longitude),
        ll_to_earth(-8.0476, -34.8770)  -- Coordenadas de Recife
    ) / 1000 AS distancia_km
FROM chamado c
WHERE
    earth_distance(
        ll_to_earth(c.latitude, c.longitude),
        ll_to_earth(-8.0476, -34.8770)
    ) <= 1000  -- 1 km
    AND c.status NOT IN ('Resolvido', 'Fechado')
ORDER BY distancia_km ASC;
```

---

## ✅ Checklist de Implementação

- [ ] Criar extensões (uuid, jsonb)
- [ ] Criar ENUMs
- [ ] Criar tabelas na ordem correta (respeitando FKs)
- [ ] Criar triggers
- [ ] Criar índices
- [ ] Inserir categorias e órgãos iniciais
- [ ] Testar constraints
- [ ] Testar triggers (workflow, imutabilidade)
- [ ] Fazer backup inicial
- [ ] Documentar conexões (Prisma schema)

---

## 📚 Próximas Etapas

1. **Prisma Schema**: Atualizar `backend/prisma/schema.prisma` com modelo acima
2. **Migrations**: `prisma migrate dev --name init`
3. **Seed**: Inserir dados de teste em `prisma/seed.ts`
4. **Tests**: Validar regras de negócio (transações, SLA, workflows)
5. **Monitoring**: Configurar alerts para SLA vencido

---

**Documento Criado**: `4_MODELO_FISICO_DDL_SQL.md`

---

*Data de Criação: 27/04/2026*
*Versão: 1.0*
*Status: Pronto para Implementação*

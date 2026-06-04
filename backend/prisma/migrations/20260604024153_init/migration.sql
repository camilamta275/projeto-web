CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "perfil" AS ENUM ('Cidadão', 'Gestor', 'Admin');

-- CreateEnum
CREATE TYPE "prioridade" AS ENUM ('Baixa', 'Média', 'Alta', 'Crítica');

-- CreateEnum
CREATE TYPE "status_chamado" AS ENUM ('Aberto', 'Em Análise', 'Em Andamento', 'Aguardando', 'Resolvido', 'Fechado');

-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('Ativo', 'Inativo');

-- CreateEnum
CREATE TYPE "tipo_notificacao" AS ENUM ('chamado', 'status', 'equipe', 'concluido', 'chamado-registrado', 'status-atualizado', 'equipe-designada', 'chamado-concluido');

-- CreateEnum
CREATE TYPE "tipo_orgao" AS ENUM ('Municipal', 'Estadual', 'Federal', 'Concessionária');

-- CreateEnum
CREATE TYPE "tipo_timeline" AS ENUM ('criacao', 'status', 'mensagem', 'transferencia', 'conclusao');

-- CreateTable
CREATE TABLE "admin" (
    "id" UUID NOT NULL,
    "nivel_acesso" VARCHAR(100) NOT NULL,
    "permissao_escopo" VARCHAR(255),
    "ultimo_login" TIMESTAMPTZ(6),
    "ativo" BOOLEAN DEFAULT true,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamado" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "protocolo" VARCHAR(20) NOT NULL,
    "descricao" TEXT NOT NULL,
    "cidadaoid" UUID NOT NULL,
    "gestorid" UUID,
    "orgaoid" VARCHAR(10) NOT NULL,
    "categoriaid" INTEGER NOT NULL,
    "subcategoria" VARCHAR(100) NOT NULL,
    "endereco" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "status" "status_chamado" NOT NULL DEFAULT 'Aberto',
    "prioridade" "prioridade" NOT NULL,
    "fotourl" VARCHAR(500),
    "slahoras" INTEGER NOT NULL,
    "sladeadline" TIMESTAMP(6) NOT NULL,
    "slaencerradoha" DECIMAL(8,2),
    "slajustification" TEXT,
    "resolutionnote" TEXT,
    "resolutionphotourl" VARCHAR(500),
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cidadao" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(11),
    "endereco" VARCHAR(255),

    CONSTRAINT "cidadao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestor" (
    "id" UUID NOT NULL,
    "orgaoid" VARCHAR(10) NOT NULL,
    "departamento" VARCHAR(100),
    "telefone" VARCHAR(20),

    CONSTRAINT "gestor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_profile" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "usuarioid" UUID NOT NULL,
    "displayname" VARCHAR(150) NOT NULL,
    "initials" VARCHAR(4) NOT NULL,
    "avatarurl" VARCHAR(500),
    "departamento" VARCHAR(100),
    "managedtickets" INTEGER NOT NULL DEFAULT 0,
    "avgresolutionhours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "slacompliancepct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacao" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "usuarioid" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" "tipo_notificacao" NOT NULL,
    "chamadoid" UUID,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lida_em" TIMESTAMP(6),

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "managerprofileid" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sistema" BOOLEAN NOT NULL DEFAULT true,
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgao" (
    "id" VARCHAR(10) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "sigla" VARCHAR(10) NOT NULL,
    "tipo" "tipo_orgao" NOT NULL,
    "slahoras" INTEGER NOT NULL,
    "responsavel" VARCHAR(150),
    "email" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20),
    "status" "status_enum" NOT NULL DEFAULT 'Ativo',
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orgao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgao_categoria" (
    "orgaoid" VARCHAR(10) NOT NULL,
    "categoriaid" INTEGER NOT NULL,

    CONSTRAINT "orgao_categoria_pkey" PRIMARY KEY ("orgaoid","categoriaid")
);

-- CreateTable
CREATE TABLE "regra_competencia" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "categoriaid" INTEGER NOT NULL,
    "subcategoria" VARCHAR(100) NOT NULL,
    "orgaoprincipalid" VARCHAR(10) NOT NULL,
    "orgaosecundarioid" VARCHAR(10),
    "slahoras" INTEGER NOT NULL,
    "prioridade" "prioridade" NOT NULL DEFAULT 'Média',
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regra_competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_event" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "chamadoid" UUID NOT NULL,
    "tipo" "tipo_timeline" NOT NULL,
    "titulo" VARCHAR(200),
    "descricao" TEXT NOT NULL,
    "autor" VARCHAR(150) NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dadosantigos" JSONB,
    "dadosnovos" JSONB,

    CONSTRAINT "timeline_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "perfil" "perfil" NOT NULL,
    "status" "status_enum" NOT NULL DEFAULT 'Ativo',
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadopor" UUID,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_audit" (
    "id" SERIAL NOT NULL,
    "usuarioid" UUID NOT NULL,
    "acao" VARCHAR(50) NOT NULL,
    "dadosantigos" JSONB,
    "dadosnovos" JSONB,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_nome_key" ON "categoria"("nome");

-- CreateIndex
CREATE INDEX "idx_categoria_ativo" ON "categoria"("ativo");

-- CreateIndex
CREATE INDEX "idx_categoria_nome" ON "categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "chamado_protocolo_key" ON "chamado"("protocolo");

-- CreateIndex
CREATE INDEX "idx_chamado_categoria" ON "chamado"("categoriaid");

-- CreateIndex
CREATE INDEX "idx_chamado_cidadao" ON "chamado"("cidadaoid", "criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_chamado_criadoem" ON "chamado"("criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_chamado_gestor" ON "chamado"("gestorid", "status", "criadoem" DESC) WHERE (gestorid IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_chamado_gestor_status_recentes" ON "chamado"("gestorid", "status", "criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_chamado_orgao" ON "chamado"("orgaoid", "status", "criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_chamado_orgao_sla_vencido" ON "chamado"("orgaoid", "sladeadline", "status");

-- CreateIndex
CREATE INDEX "idx_chamado_prioridade" ON "chamado"("prioridade");

-- CreateIndex
CREATE INDEX "idx_chamado_protocolo" ON "chamado"("protocolo");

-- CreateIndex
CREATE INDEX "idx_chamado_sla" ON "chamado"("sladeadline", "status") WHERE (status = ANY (ARRAY['Aberto'::status_chamado, 'Em Análise'::status_chamado, 'Em Andamento'::status_chamado, 'Aguardando'::status_chamado]));

-- CreateIndex
CREATE INDEX "idx_chamado_status" ON "chamado"("status", "criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_dashboard_orgao" ON "chamado"("orgaoid", "criadoem" DESC, "status");

-- CreateIndex
CREATE INDEX "idx_fila_gestor" ON "chamado"("gestorid", "status", "criadoem" DESC) WHERE ((gestorid IS NOT NULL) AND (status = ANY (ARRAY['Aberto'::status_chamado, 'Em Análise'::status_chamado])));

-- CreateIndex
CREATE INDEX "idx_relatorio_resolucao" ON "chamado"("orgaoid", "status", "atualizadoem" DESC) WHERE (status = ANY (ARRAY['Resolvido'::status_chamado, 'Fechado'::status_chamado]));

-- CreateIndex
CREATE INDEX "idx_sla_vencido" ON "chamado"("orgaoid", "sladeadline") WHERE (status <> ALL (ARRAY['Resolvido'::status_chamado, 'Fechado'::status_chamado]));

-- CreateIndex
CREATE UNIQUE INDEX "cidadao_cpf_key" ON "cidadao"("cpf");

-- CreateIndex
CREATE INDEX "idx_cidadao_cpf" ON "cidadao"("cpf") WHERE (cpf IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_gestor_orgao" ON "gestor"("orgaoid");

-- CreateIndex
CREATE UNIQUE INDEX "manager_profile_usuarioid_key" ON "manager_profile"("usuarioid");

-- CreateIndex
CREATE INDEX "idx_manager_profile_sla" ON "manager_profile"("slacompliancepct" DESC);

-- CreateIndex
CREATE INDEX "idx_manager_profile_usuario" ON "manager_profile"("usuarioid");

-- CreateIndex
CREATE INDEX "idx_notif_nao_lida" ON "notificacao"("usuarioid", "lida", "criadoem" DESC) WHERE (lida = false);

-- CreateIndex
CREATE INDEX "idx_notificacao_chamado" ON "notificacao"("chamadoid") WHERE (chamadoid IS NOT NULL);

-- CreateIndex
CREATE INDEX "idx_notificacao_criadoem" ON "notificacao"("criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_notificacao_lida" ON "notificacao"("lida");

-- CreateIndex
CREATE INDEX "idx_notificacao_usuario" ON "notificacao"("usuarioid");

-- CreateIndex
CREATE INDEX "idx_notificacao_usuario_lida" ON "notificacao"("usuarioid", "lida", "criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_notif_pref_manager" ON "notification_preference"("managerprofileid");

-- CreateIndex
CREATE UNIQUE INDEX "orgao_nome_key" ON "orgao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "orgao_sigla_key" ON "orgao"("sigla");

-- CreateIndex
CREATE INDEX "idx_orgao_sigla" ON "orgao"("sigla");

-- CreateIndex
CREATE INDEX "idx_orgao_status" ON "orgao"("status");

-- CreateIndex
CREATE INDEX "idx_orgao_tipo" ON "orgao"("tipo");

-- CreateIndex
CREATE INDEX "idx_orgao_categoria_categoria" ON "orgao_categoria"("categoriaid");

-- CreateIndex
CREATE INDEX "idx_regra_categoria" ON "regra_competencia"("categoriaid");

-- CreateIndex
CREATE INDEX "idx_regra_categoria_sub" ON "regra_competencia"("categoriaid", "subcategoria");

-- CreateIndex
CREATE INDEX "idx_regra_orgao_principal" ON "regra_competencia"("orgaoprincipalid");

-- CreateIndex
CREATE INDEX "idx_regra_orgao_secundario" ON "regra_competencia"("orgaosecundarioid") WHERE (orgaosecundarioid IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_subcategoria_unica" ON "regra_competencia"("categoriaid", "subcategoria");

-- CreateIndex
CREATE INDEX "idx_timeline_chamado" ON "timeline_event"("chamadoid");

-- CreateIndex
CREATE INDEX "idx_timeline_chamado_desc" ON "timeline_event"("chamadoid", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_timeline_timestamp" ON "timeline_event"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_timeline_tipo" ON "timeline_event"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_criadoem" ON "usuario"("criadoem" DESC);

-- CreateIndex
CREATE INDEX "idx_usuario_email" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_perfil" ON "usuario"("perfil");

-- CreateIndex
CREATE INDEX "idx_usuario_status" ON "usuario"("status");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chamado" ADD CONSTRAINT "chamado_categoriaid_fkey" FOREIGN KEY ("categoriaid") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chamado" ADD CONSTRAINT "chamado_cidadaoid_fkey" FOREIGN KEY ("cidadaoid") REFERENCES "cidadao"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chamado" ADD CONSTRAINT "chamado_gestorid_fkey" FOREIGN KEY ("gestorid") REFERENCES "gestor"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chamado" ADD CONSTRAINT "chamado_orgaoid_fkey" FOREIGN KEY ("orgaoid") REFERENCES "orgao"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cidadao" ADD CONSTRAINT "cidadao_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_id_fkey" FOREIGN KEY ("id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_orgaoid_fkey" FOREIGN KEY ("orgaoid") REFERENCES "orgao"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "manager_profile" ADD CONSTRAINT "manager_profile_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "gestor"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_chamadoid_fkey" FOREIGN KEY ("chamadoid") REFERENCES "chamado"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_managerprofileid_fkey" FOREIGN KEY ("managerprofileid") REFERENCES "manager_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orgao_categoria" ADD CONSTRAINT "orgao_categoria_categoriaid_fkey" FOREIGN KEY ("categoriaid") REFERENCES "categoria"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orgao_categoria" ADD CONSTRAINT "orgao_categoria_orgaoid_fkey" FOREIGN KEY ("orgaoid") REFERENCES "orgao"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regra_competencia" ADD CONSTRAINT "regra_competencia_categoriaid_fkey" FOREIGN KEY ("categoriaid") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regra_competencia" ADD CONSTRAINT "regra_competencia_orgaoprincipalid_fkey" FOREIGN KEY ("orgaoprincipalid") REFERENCES "orgao"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regra_competencia" ADD CONSTRAINT "regra_competencia_orgaosecundarioid_fkey" FOREIGN KEY ("orgaosecundarioid") REFERENCES "orgao"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_chamadoid_fkey" FOREIGN KEY ("chamadoid") REFERENCES "chamado"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario_audit" ADD CONSTRAINT "usuario_audit_usuarioid_fkey" FOREIGN KEY ("usuarioid") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CreateTable
CREATE TABLE "routing_rules" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "category_id" INTEGER NOT NULL,
    "organ_id" VARCHAR(10) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "admin_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_routing_rules_category" ON "routing_rules"("category_id");

-- CreateIndex
CREATE INDEX "idx_routing_rules_category_active" ON "routing_rules"("category_id", "active") WHERE ("active" = true);

-- CreateIndex
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_logs_admin_id" ON "audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "routing_rules" ADD CONSTRAINT "routing_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "routing_rules" ADD CONSTRAINT "routing_rules_organ_id_fkey" FOREIGN KEY ("organ_id") REFERENCES "orgao"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AlterTable: allow demands without a resolved organ
ALTER TABLE "chamado" ALTER COLUMN "orgaoid" DROP NOT NULL;

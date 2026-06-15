-- DropForeignKey
ALTER TABLE "chamado" DROP CONSTRAINT "chamado_orgaoid_fkey";

-- DropIndex
DROP INDEX "idx_routing_rules_category_active";

-- CreateIndex
CREATE INDEX "idx_routing_rules_category_active" ON "routing_rules"("category_id", "active");

-- AddForeignKey
ALTER TABLE "chamado" ADD CONSTRAINT "chamado_orgaoid_fkey" FOREIGN KEY ("orgaoid") REFERENCES "orgao"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

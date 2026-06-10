-- CreateTable
CREATE TABLE "metrics_snapshot" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "porstatus" JSONB NOT NULL,
    "porcategoria" JSONB NOT NULL,
    "tempomedioresolucao" DECIMAL(10,2) NOT NULL,
    "jobstatus" VARCHAR(20) NOT NULL DEFAULT 'success',
    "errormessage" TEXT,
    "criadoem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_metrics_snapshot_criadoem" ON "metrics_snapshot"("criadoem" DESC);

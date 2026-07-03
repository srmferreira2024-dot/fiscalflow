-- AlterEnum
-- This migration adds a new variant `PENDENTE_FILA` to the `InvoiceStatus` enum.
-- Existing enum values are kept.
-- Explicitly update the types using `ALTER TYPE`.
ALTER TYPE "InvoiceStatus" ADD VALUE 'PENDENTE_FILA';

-- AlterEnum
-- This migration adds a new variant `ERRO_PERMANENTE` to the `InvoiceStatus` enum.
-- Existing enum values are kept.
ALTER TYPE "InvoiceStatus" ADD VALUE 'ERRO_PERMANENTE';

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "lastErrorMessage" TEXT;

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

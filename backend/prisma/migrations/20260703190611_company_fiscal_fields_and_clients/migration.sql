-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "cnae" TEXT,
ADD COLUMN     "fiscalSettings" JSONB,
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "inscricaoMunicipal" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "regimeTributario" "TaxRegime",
ADD COLUMN     "uf" TEXT;

-- CreateTable
CREATE TABLE "company_certificates" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "encryptedData" BYTEA NOT NULL,
    "dataIv" BYTEA NOT NULL,
    "dataAuthTag" BYTEA NOT NULL,
    "encryptedPassword" BYTEA NOT NULL,
    "passwordIv" BYTEA NOT NULL,
    "passwordAuthTag" BYTEA NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validoAte" TIMESTAMP(3),

    CONSTRAINT "company_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "document" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "zipCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_certificates_companyId_key" ON "company_certificates"("companyId");

-- CreateIndex
CREATE INDEX "clients_officeId_idx" ON "clients"("officeId");

-- CreateIndex
CREATE INDEX "clients_companyId_idx" ON "clients"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_companyId_document_key" ON "clients"("companyId", "document");

-- AddForeignKey
ALTER TABLE "company_certificates" ADD CONSTRAINT "company_certificates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

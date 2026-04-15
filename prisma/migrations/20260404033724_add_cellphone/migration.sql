ALTER TABLE "User" ADD COLUMN "cellphone" TEXT;

-- Preenche os usuários existentes com um valor temporário
UPDATE "User" SET "cellphone" = '' WHERE "cellphone" IS NULL;

-- Agora torna obrigatório
ALTER TABLE "User" ALTER COLUMN "cellphone" SET NOT NULL;
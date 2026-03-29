/*
  Warnings:

  - You are about to drop the column `autor` on the `Mensagem` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Mensagem` table. All the data in the column will be lost.
  - Added the required column `author` to the `Mensagem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Mensagem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('USER', 'ASSISTANT');

-- DropForeignKey
ALTER TABLE "Mensagem" DROP CONSTRAINT "Mensagem_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Mensagem" DROP COLUMN "autor",
DROP COLUMN "usuarioId",
ADD COLUMN     "author" "AuthorType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

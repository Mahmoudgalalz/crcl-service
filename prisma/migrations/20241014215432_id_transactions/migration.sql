/*
  Warnings:

  - The primary key for the `walletTransactions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "walletTransactions" DROP CONSTRAINT "walletTransactions_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "walletTransactions_pkey" PRIMARY KEY ("id");

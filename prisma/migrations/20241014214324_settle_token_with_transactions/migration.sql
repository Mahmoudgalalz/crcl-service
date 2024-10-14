/*
  Warnings:

  - Added the required column `tokenPrice` to the `walletTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "walletTransactions" ADD COLUMN     "tokenPrice" DOUBLE PRECISION NOT NULL;

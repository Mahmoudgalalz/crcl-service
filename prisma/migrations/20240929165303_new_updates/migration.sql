/*
  Warnings:

  - The `gender` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `tokenPrice` on the `Wallet` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "tokenPrice",
ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "WalletToken" (
    "id" SERIAL NOT NULL,
    "tokenPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.05,

    CONSTRAINT "WalletToken_pkey" PRIMARY KEY ("id")
);

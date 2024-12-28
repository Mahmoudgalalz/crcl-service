/*
  Warnings:

  - You are about to drop the column `notificationToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "deletedAt" TEXT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

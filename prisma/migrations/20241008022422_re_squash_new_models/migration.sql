/*
  Warnings:

  - The values [BOOKED,APPROVED,DECLINED] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `externalEmail` on the `TicketPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `externalFacebook` on the `TicketPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `externalInstagram` on the `TicketPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `externalPhone` on the `TicketPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `TicketPurchase` table. All the data in the column will be lost.
  - Added the required column `updateAt` to the `TicketPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('BOOKED', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'UN_PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('UPCOMMING', 'ATTENDED', 'PAST_DUE');
ALTER TABLE "TicketPurchase" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "TicketStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "TicketPurchase_ticketId_userId_idx";

-- AlterTable
ALTER TABLE "TicketPurchase" DROP COLUMN "externalEmail",
DROP COLUMN "externalFacebook",
DROP COLUMN "externalInstagram",
DROP COLUMN "externalPhone",
DROP COLUMN "purchaseDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "payment" "PaymentStatus",
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EventRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'BOOKED',

    CONSTRAINT "EventRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventRequest_eventId_idx" ON "EventRequest"("eventId");

-- CreateIndex
CREATE INDEX "Ticket_eventId_idx" ON "Ticket"("eventId");

-- CreateIndex
CREATE INDEX "TicketPurchase_userId_ticketId_idx" ON "TicketPurchase"("userId", "ticketId");

-- AddForeignKey
ALTER TABLE "EventRequest" ADD CONSTRAINT "EventRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRequest" ADD CONSTRAINT "EventRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

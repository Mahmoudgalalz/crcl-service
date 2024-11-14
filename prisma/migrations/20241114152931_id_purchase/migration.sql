/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `TicketPurchase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TicketPurchase_userId_ticketId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "TicketPurchase_id_key" ON "TicketPurchase"("id");

-- CreateIndex
CREATE INDEX "TicketPurchase_userId_ticketId_id_idx" ON "TicketPurchase"("userId", "ticketId", "id");

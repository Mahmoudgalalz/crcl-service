-- DropIndex
DROP INDEX "TicketPurchase_userId_ticketId_id_idx";

-- CreateIndex
CREATE INDEX "TicketPurchase_userId_id_idx" ON "TicketPurchase"("userId", "id");

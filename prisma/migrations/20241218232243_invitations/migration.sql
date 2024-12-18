-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('UPCOMMING', 'ATTENDED');

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "ticketId" TEXT,
    "payment" "PaymentStatus",
    "paymentReference" TEXT,
    "type" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'UPCOMMING',
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_id_key" ON "Invitation"("id");

-- CreateIndex
CREATE INDEX "Invitation_eventId_id_ticketId_paymentReference_idx" ON "Invitation"("eventId", "id", "ticketId", "paymentReference");

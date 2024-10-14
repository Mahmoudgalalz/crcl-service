-- CreateTable
CREATE TABLE "walletTransactions" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "walletTransactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "walletTransactions" ADD CONSTRAINT "walletTransactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

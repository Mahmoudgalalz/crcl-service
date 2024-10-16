/*
  Warnings:

  - Added the required column `updateAt` to the `WalletToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `walletTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `walletTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `walletTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletToken" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "walletTransactions" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "status" "PaymentStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "walletTransactions_id_seq";

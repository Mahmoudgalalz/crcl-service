/*
  Warnings:

  - The `type` column on the `SuperUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SuperUserType" AS ENUM ('ADMIN', 'FINANCE', 'MODERATOR', 'APPROVAL');

-- AlterTable
ALTER TABLE "SuperUser" DROP COLUMN "type",
ADD COLUMN     "type" "SuperUserType" NOT NULL DEFAULT 'ADMIN';

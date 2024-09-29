-- AlterTable
ALTER TABLE "SuperUser" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ADMIN';

UPDATE "SuperUser" SET "type" = 'ADMIN' WHERE "type" IS NULL;
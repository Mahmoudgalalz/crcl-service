-- AlterTable
ALTER TABLE "meta" ADD COLUMN     "key" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "meta_key_idx" ON "meta"("key");

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "coordinates" JSONB;

-- AlterTable
ALTER TABLE "meta" ADD COLUMN     "androidVersion" TEXT,
ADD COLUMN     "iosVersion" TEXT;

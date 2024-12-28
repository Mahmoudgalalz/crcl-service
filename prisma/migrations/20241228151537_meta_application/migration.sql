-- CreateTable
CREATE TABLE "meta" (
    "id" TEXT NOT NULL,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "meta_pkey" PRIMARY KEY ("id")
);

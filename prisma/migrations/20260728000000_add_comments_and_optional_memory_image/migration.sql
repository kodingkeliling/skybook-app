-- AlterTable
ALTER TABLE "memories"
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comments"
ADD CONSTRAINT "comments_memoryId_fkey"
FOREIGN KEY ("memoryId") REFERENCES "memories"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

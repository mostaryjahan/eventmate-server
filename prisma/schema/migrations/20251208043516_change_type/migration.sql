/*
  Warnings:

  - You are about to drop the column `type` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_typeId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "type";

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "eventTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

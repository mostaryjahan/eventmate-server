-- CreateTable
CREATE TABLE IF NOT EXISTS "eventTypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "eventTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "eventTypes_name_key" ON "eventTypes"("name");

-- AlterTable
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "typeId" TEXT;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'events_typeId_fkey'
    ) THEN
        ALTER TABLE "events" ADD CONSTRAINT "events_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "eventTypes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

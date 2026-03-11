-- Initial SQLite schema for Gestor ICE MVP tasks persistence.

-- CreateTable
CREATE TABLE "Task" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "impact" INTEGER,
  "confidence" INTEGER,
  "effort" INTEGER,
  "iceScore" INTEGER,
  "iceSource" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
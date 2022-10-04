-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "assistantTownId" TEXT,
    "residentTownId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "loginLocation" TEXT NOT NULL DEFAULT 'world:0:0',
    "logoutLocation" TEXT NOT NULL DEFAULT 'world:0:0',
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Town" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nation" TEXT,
    "ownerId" TEXT NOT NULL,
    "pvp" BOOLEAN NOT NULL,
    "world" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,

    CONSTRAINT "Town_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TownCoordinates" (
    "id" TEXT NOT NULL,
    "group" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "world" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,
    "townId" TEXT,

    CONSTRAINT "TownCoordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeleportCoordinates" (
    "id" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,
    "fromTeleportId" TEXT,
    "toTeleportId" TEXT,

    CONSTRAINT "TeleportCoordinates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teleport" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teleport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trank" (
    "id" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "z" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "Trank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Player_uuid_key" ON "Player"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Town_name_key" ON "Town"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Town_ownerId_key" ON "Town"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeleportCoordinates_fromTeleportId_key" ON "TeleportCoordinates"("fromTeleportId");

-- CreateIndex
CREATE UNIQUE INDEX "TeleportCoordinates_toTeleportId_key" ON "TeleportCoordinates"("toTeleportId");

-- CreateIndex
CREATE UNIQUE INDEX "Trank_name_key" ON "Trank"("name");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_assistantTownId_fkey" FOREIGN KEY ("assistantTownId") REFERENCES "Town"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_residentTownId_fkey" FOREIGN KEY ("residentTownId") REFERENCES "Town"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Town" ADD CONSTRAINT "Town_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TownCoordinates" ADD CONSTRAINT "TownCoordinates_townId_fkey" FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleportCoordinates" ADD CONSTRAINT "TeleportCoordinates_fromTeleportId_fkey" FOREIGN KEY ("fromTeleportId") REFERENCES "Teleport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeleportCoordinates" ADD CONSTRAINT "TeleportCoordinates_toTeleportId_fkey" FOREIGN KEY ("toTeleportId") REFERENCES "Teleport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teleport" ADD CONSTRAINT "Teleport_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `Provider_Location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Provider_Location_provider_id_key" ON "Provider_Location"("provider_id");

/*
  Warnings:

  - A unique constraint covering the columns `[provider_id,day]` on the table `Provider_Avalibility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Provider_Avalibility_provider_id_day_key" ON "Provider_Avalibility"("provider_id", "day");

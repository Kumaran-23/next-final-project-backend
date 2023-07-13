/*
  Warnings:

  - Added the required column `booking_date` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "booking_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "booking_starttime" SET DATA TYPE TEXT,
ALTER COLUMN "booking_endtime" SET DATA TYPE TEXT;

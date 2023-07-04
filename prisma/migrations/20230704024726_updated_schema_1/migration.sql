-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photo_url" TEXT;

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "hourly_rate" INTEGER NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider_Location" (
    "id" SERIAL NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Provider_Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider_Avalibility" (
    "id" SERIAL NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_Avalibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "booking_starttime" TIMESTAMP(3) NOT NULL,
    "booking_endtime" TIMESTAMP(3) NOT NULL,
    "service_fee" INTEGER NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_photo_url_key" ON "Provider"("photo_url");

-- AddForeignKey
ALTER TABLE "Provider_Location" ADD CONSTRAINT "Provider_Location_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider_Avalibility" ADD CONSTRAINT "Provider_Avalibility_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

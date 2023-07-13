-- CreateTable
CREATE TABLE "Provider_Image" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,

    CONSTRAINT "Provider_Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_Image_image_url_key" ON "Provider_Image"("image_url");

-- AddForeignKey
ALTER TABLE "Provider_Image" ADD CONSTRAINT "Provider_Image_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

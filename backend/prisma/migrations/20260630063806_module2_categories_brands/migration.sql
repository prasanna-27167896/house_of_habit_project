-- CreateTable
CREATE TABLE "categories" (
    "categoryId" SERIAL NOT NULL,
    "categoryTitle" VARCHAR(100) NOT NULL,
    "categoryDescription" TEXT,
    "imageUrl" TEXT,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateTable
CREATE TABLE "brands" (
    "brandId" SERIAL NOT NULL,
    "brandName" TEXT NOT NULL,
    "brandCode" TEXT,
    "status" TEXT,
    "imageUrl" TEXT,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("brandId")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_categoryTitle_key" ON "categories"("categoryTitle");

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

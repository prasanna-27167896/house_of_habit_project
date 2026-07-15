/*
  Warnings:

  - You are about to drop the column `numRatings` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "numRatings",
ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "createdAt",
ADD COLUMN     "creatadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
ADD COLUMN     "creatadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

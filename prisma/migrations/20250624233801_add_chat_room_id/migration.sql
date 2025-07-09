/*
  Warnings:

  - Added the required column `chatRoomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `chatRoomId` VARCHAR(191) NOT NULL;

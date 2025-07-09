/*
  Warnings:

  - The primary key for the `message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `message` table. All the data in the column will be lost.
  - Added the required column `chatRoomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `chatRoomId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`chatRoomId`);

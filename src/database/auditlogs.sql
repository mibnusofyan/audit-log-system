CREATE TABLE `auditLogs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NULL,
    `action` VARCHAR(255) NOT NULL,
    `entity` VARCHAR(255) NULL,
    `entityId` INT NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(255) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Opsional: Menambahkan Foreign Key Constraint langsung ke tabel Users
    FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);
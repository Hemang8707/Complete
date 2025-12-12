-- Migration: Add user_type and OTP verification fields
-- Date: 2025-12-12
-- Description: Adds support for Individual/Enterprise user types and email OTP verification

-- ============================================================
-- ADD NEW COLUMNS TO USERS TABLE
-- ============================================================

-- Add user_type column to distinguish between individual and enterprise users
ALTER TABLE `users` 
ADD COLUMN `user_type` ENUM('individual', 'enterprise') NOT NULL DEFAULT 'enterprise' AFTER `id`;

-- Add email verification columns
ALTER TABLE `users`
ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0 AFTER `password`,
ADD COLUMN `email_verified_at` TIMESTAMP NULL AFTER `email_verified`;

-- Modify nullable columns for individual users
-- For individuals: gst_number, cancel_cheque_photo, shop_photo, enterprise_type can be NULL
ALTER TABLE `users` 
MODIFY COLUMN `gst_number` VARCHAR(50) NULL,
MODIFY COLUMN `cancel_cheque_photo` VARCHAR(500) NULL,
MODIFY COLUMN `shop_photo` VARCHAR(500) NULL,
MODIFY COLUMN `enterprise_type` ENUM('sole-proprietorship', 'partnership', 'private-limited', 'public-limited', 'llp', 'individual') NULL;


-- ============================================================
-- CREATE OTP VERIFICATION TABLE
-- ============================================================

DROP TABLE IF EXISTS `otp_verifications`;

CREATE TABLE `otp_verifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `otp_code` VARCHAR(6) NOT NULL,
  `otp_type` ENUM('signup', 'password_reset', 'email_change') NOT NULL DEFAULT 'signup',
  `expires_at` TIMESTAMP NOT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `attempts` INT NOT NULL DEFAULT 0,
  `max_attempts` INT NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `verified_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email_otp` (`email`, `otp_code`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CREATE PENDING REGISTRATIONS TABLE
-- Stores signup data until OTP is verified
-- ============================================================

DROP TABLE IF EXISTS `pending_registrations`;

CREATE TABLE `pending_registrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_type` ENUM('individual', 'enterprise') NOT NULL,
  `dealer_name` VARCHAR(255) NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(255) NOT NULL,
  `owner_mobile` VARCHAR(15) NOT NULL,
  `gst_number` VARCHAR(50) NULL,
  `cancel_cheque_photo` VARCHAR(500) NULL,
  `shop_photo` VARCHAR(500) NULL,
  `enterprise_type` VARCHAR(50) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `otp_code` VARCHAR(6) NOT NULL,
  `otp_expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pending_email` (`email`),
  KEY `idx_otp_lookup` (`email`, `otp_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CLEANUP OLD OTP RECORDS (Optional - for maintenance)
-- Run this periodically to remove expired OTPs
-- ============================================================

-- DELETE FROM otp_verifications WHERE expires_at < NOW();
-- DELETE FROM pending_registrations WHERE otp_expires_at < NOW();


-- ============================================================
-- UPDATE EXISTING USERS (if any) TO HAVE email_verified = 1
-- So existing users don't get locked out
-- ============================================================

UPDATE `users` SET `email_verified` = 1 WHERE `email_verified` = 0;


-- ============================================================
-- END OF MIGRATION
-- ============================================================

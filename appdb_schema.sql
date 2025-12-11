-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: appdb
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `baningcredentials`
--

DROP TABLE IF EXISTS `baningcredentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baningcredentials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobileNo` varchar(15) NOT NULL,
  `customerName` varchar(100) NOT NULL,
  `bankName` varchar(100) NOT NULL,
  `cardType` varchar(50) NOT NULL,
  `cardNumber` varchar(20) NOT NULL,
  `expiryDate` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cardLimit` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mobile_bank` (`mobileNo`,`bankName`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `baningcredentials_old`
--

DROP TABLE IF EXISTS `baningcredentials_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baningcredentials_old` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobileNo` varchar(15) NOT NULL,
  `customerName` varchar(100) NOT NULL,
  `bankName` varchar(50) NOT NULL,
  `cardType` varchar(20) DEFAULT NULL,
  `cardNumber` varchar(20) DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bankName` varchar(100) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `asset` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `discountAvailable` enum('yes','no') NOT NULL DEFAULT 'no',
  `discountName` varchar(255) NOT NULL,
  `discountPercent` decimal(5,2) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `mobileNo` varchar(15) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bank_product` (`bankName`,`brand`,`asset`,`model`),
  KEY `idx_mobile` (`mobileNo`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `offers_old`
--

DROP TABLE IF EXISTS `offers_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers_old` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bankname` varchar(50) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `asset` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `discountavailable` enum('yes','no') DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `discountname` varchar(255) DEFAULT NULL,
  `mobileNo` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dealer_code` varchar(10) DEFAULT NULL,
  `dealer_name` varchar(255) NOT NULL,
  `mobile_number` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `owner_mobile` varchar(15) NOT NULL,
  `gst_number` varchar(50) NOT NULL,
  `cancel_cheque_photo` varchar(500) DEFAULT NULL,
  `shop_photo` varchar(500) DEFAULT NULL,
  `enterprise_type` enum('sole-proprietorship','partnership','private-limited','public-limited','llp') NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `dealer_code` (`dealer_code`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 22:45:32

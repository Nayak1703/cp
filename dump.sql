-- MySQL dump 10.13  Distrib 8.4.6, for macos15 (x86_64)
--
-- Host: localhost    Database: career_portal
-- ------------------------------------------------------
-- Server version	8.4.6

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
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobId` int NOT NULL,
  `candidateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationStatus` enum('REJECTED','REVIEWING','SHORTLISTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REVIEWING',
  `appliedOn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`applicationId`),
  KEY `applications_jobId_fkey` (`jobId`),
  KEY `applications_candidateId_fkey` (`candidateId`),
  CONSTRAINT `applications_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate_info` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `applications_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs` (`jobId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_info`
--

DROP TABLE IF EXISTS `candidate_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_info` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int DEFAULT NULL,
  `currentRole` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalExperience` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expectedCTC` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skills` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portfolioLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `githubLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedinLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitterLink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `readyToRelocate` tinyint(1) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `education` text COLLATE utf8mb4_unicode_ci,
  `work` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `candidate_info_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_info`
--

LOCK TABLES `candidate_info` WRITE;
/*!40000 ALTER TABLE `candidate_info` DISABLE KEYS */;
INSERT INTO `candidate_info` VALUES ('cmdudn0yd0001ou49wfczyiwc','Yash','Nayak','nayakyash10@gmail.com','$2b$12$1bt2dXqslxpgiFI.W3xzvOoSMbSXjJJ4SotJtBHMT/nTXFxtDAJ1u',24,'SDE 0','2','MUMBAI','10','mern stack','fafadf','https://github.com/nayak1703','https://www.linkedin.com/in/yash-nayak-hk/','fafadads','/uploads/resumes/resume_cmdudn0yd0001ou49wfczyiwc.pdf',0,'2025-08-02 14:57:55.093','2025-08-03 05:19:29.202','[{\"institution\":\"LR tiwari\",\"program\":\"BE\",\"specialization\":\"Computer Science\",\"from\":\"2025-08-04\",\"till\":\"2025-08-14\"},{\"institution\":\"afadf\",\"program\":\"fadfa\",\"specialization\":\"fadfa\",\"from\":\"2025-08-06\",\"till\":\"2025-09-04\"}]','[{\"organization\":\"fadf\",\"role\":\"adfad\",\"designation\":\"fadfsd\",\"whatYouDo\":\"fafdads\",\"from\":\"2025-08-15\",\"till\":\"2025-08-22\"},{\"organization\":\"fafad\",\"role\":\"fadfadf\",\"designation\":\"fafads\",\"whatYouDo\":\"adfadsf\",\"from\":\"2025-08-11\",\"till\":\"2025-08-22\"}]');
/*!40000 ALTER TABLE `candidate_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_info`
--

DROP TABLE IF EXISTS `hr_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_info` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hr_info_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_info`
--

LOCK TABLES `hr_info` WRITE;
/*!40000 ALTER TABLE `hr_info` DISABLE KEYS */;
INSERT INTO `hr_info` VALUES ('cmdudr13u0000ousufjvsfytv','admin','','owner','yashsukantnayak@gmail.com','admin','8692017271','admin','2025-08-02 15:01:01.914','2025-08-02 15:41:48.039'),('cmduguhqh0000ou6nlkdwfuq7','Krunal','Ambre','participant','user@gmail.com','$2b$12$j4X56BI5W.THIhKMlq720.m1R/qkeTgl0krTvtep9CzyQsGaJhQMm','+91 82828282','Mochi','2025-08-02 16:27:42.279','2025-08-02 16:28:13.216'),('cmdugzvuj0001ou6nnqqxlbtm','Akash','Jha','moderator','user1@gmail.com','$2b$12$G3nEPEC3VnL/dI8PNeBauO.xt0QrdQKYgbkpmsFt.ESUPg.H.ker6','1111111111111','Bihari','2025-08-02 16:31:53.852','2025-08-02 16:31:53.852'),('cmduhd25z0002ou6nbn1pp3zg','Rupesh','Jha','admin','user2@gmail.com','$2b$12$LiiLiA0jqz7OKkIiK3Tpwei5YwHbkNYP/YHAWR8jXcAZiqcvT4JTu','6969696969','Ambassador','2025-08-02 16:42:08.568','2025-08-02 16:42:08.568'),('cmduhf3j00003ou6njy5r593l','Yash','Nayak','admin','nayak.learner@gmail.com','$2b$12$U5Zh.HYhEc90ybV5LSpcU.UhsJDKYbwkms5uJ/gEO/UGFpRAuUGiW','10101010101','Prime Minister','2025-08-02 16:43:43.645','2025-08-02 16:43:43.645');
/*!40000 ALTER TABLE `hr_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `jobId` int NOT NULL AUTO_INCREMENT,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobStatus` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `experience` enum('LESS_THAN_2','TWO_TO_FIVE','FIVE_TO_EIGHT','EIGHT_TO_TWELVE','MORE_THAN_12') COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` enum('ENGINEERING','MARKETING','QA','DEVOPS','PRODUCT_MANAGER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` enum('MUMBAI','BHUBANESWAR','DELHI','BANGALORE','HYDERABAD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobDescription` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `postedOn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `hrId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`jobId`),
  KEY `jobs_jobStatus_idx` (`jobStatus`),
  KEY `jobs_department_idx` (`department`),
  KEY `jobs_location_idx` (`location`),
  KEY `jobs_experience_idx` (`experience`),
  KEY `jobs_postedOn_idx` (`postedOn`),
  KEY `jobs_hrId_fkey` (`hrId`),
  CONSTRAINT `jobs_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `hr_info` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobId` int NOT NULL,
  `candidateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `savedOn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_jobs_jobId_candidateId_key` (`jobId`,`candidateId`),
  KEY `saved_jobs_candidateId_idx` (`candidateId`),
  KEY `saved_jobs_jobId_idx` (`jobId`),
  CONSTRAINT `saved_jobs_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `candidate_info` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `saved_jobs_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs` (`jobId`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-03 14:48:08

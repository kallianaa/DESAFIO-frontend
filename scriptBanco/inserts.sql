-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: desafiofront
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `aluno`
--

LOCK TABLES `aluno` WRITE;
/*!40000 ALTER TABLE `aluno` DISABLE KEYS */;
INSERT INTO `aluno` VALUES ('fa5bcf1a-ca0b-44e8-907d-1b0a6a970936','7777');
/*!40000 ALTER TABLE `aluno` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
INSERT INTO `disciplina` VALUES ('59ad601c-c255-11f0-8d51-345a604d6ceb','LABI01','Laboratório I',4),('7ad049fa-c255-11f0-8d51-345a604d6ceb','PRGI01','Programação I',4),('8fa318a1-c255-11f0-8d51-345a604d6ceb','FRONT01','Front-End',3);
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `matricula`
--

LOCK TABLES `matricula` WRITE;
/*!40000 ALTER TABLE `matricula` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `prerequisito`
--

LOCK TABLES `prerequisito` WRITE;
/*!40000 ALTER TABLE `prerequisito` DISABLE KEYS */;
/*!40000 ALTER TABLE `prerequisito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
INSERT INTO `professor` VALUES ('5c0e3c8e-0b4c-4e7b-8526-9f0a05a1ed19','654321');
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ADMIN'),(2,'PROFESSOR'),(3,'ALUNO');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `turma`
--

LOCK TABLES `turma` WRITE;
/*!40000 ALTER TABLE `turma` DISABLE KEYS */;
/*!40000 ALTER TABLE `turma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES ('5c0e3c8e-0b4c-4e7b-8526-9f0a05a1ed19','professor','professor@gmail.com','$2a$12$8xq07Qot0z2RfZExYx/1Ae5.pTEwYTngqMu0lGyhAK5K4FpD3NFu6'),('db758816-e241-41d7-b93d-472ab386f4a3','admin','admin@gmail.com','$2a$12$x70edKlH9e2yy6R6W07nd.eG3ZwNCn6BcEpqoaEOxYjGxG9.wrOP.'),('fa5bcf1a-ca0b-44e8-907d-1b0a6a970936','aluno','aluno@gmail.com','$2a$12$sdbJEKLt7AQrOO4Dyx8K2OcPhvQZmYqwxz8i5Oz88l.e.5tr3Op1e');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuariorole`
--

LOCK TABLES `usuariorole` WRITE;
/*!40000 ALTER TABLE `usuariorole` DISABLE KEYS */;
INSERT INTO `usuariorole` VALUES ('db758816-e241-41d7-b93d-472ab386f4a3',1),('5c0e3c8e-0b4c-4e7b-8526-9f0a05a1ed19',2),('fa5bcf1a-ca0b-44e8-907d-1b0a6a970936',3);
/*!40000 ALTER TABLE `usuariorole` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 16:10:21

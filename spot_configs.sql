-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2015 at 06:42 AM
-- Server version: 5.5.36
-- PHP Version: 5.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `qbox`
--

-- --------------------------------------------------------

--
-- Table structure for table `spot_configs`
--

DROP TABLE IF EXISTS `spot_configs`;
CREATE TABLE IF NOT EXISTS `spot_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=57 ;

--
-- Dumping data for table `spot_configs`
--

INSERT INTO `spot_configs` (`id`, `number`, `type`, `name`) VALUES
(1, 1, 'powered,unpowered', ''),
(2, 2, 'powered,unpowered', ''),
(3, 3, 'powered,unpowered', ''),
(4, 4, 'powered,unpowered', ''),
(5, 5, 'powered,unpowered', ''),
(6, 6, 'powered,unpowered', ''),
(7, 7, 'powered,unpowered', ''),
(8, 8, 'powered,unpowered', ''),
(9, 9, 'powered,unpowered', ''),
(10, 10, 'powered,unpowered', ''),
(11, 11, 'powered,unpowered', ''),
(12, 12, 'powered,unpowered', ''),
(13, 13, 'powered,unpowered', ''),
(14, 14, 'powered,unpowered', ''),
(15, 15, 'powered,unpowered', ''),
(16, 16, 'powered,unpowered', ''),
(17, 17, 'powered,unpowered', ''),
(18, 18, 'powered,unpowered', ''),
(19, 19, 'powered,unpowered', ''),
(20, 20, 'powered,unpowered', ''),
(21, 21, 'powered,unpowered', ''),
(22, 22, 'powered,unpowered', ''),
(23, 23, 'powered,unpowered', ''),
(24, 24, 'powered,unpowered', ''),
(25, 25, 'powered,unpowered', ''),
(26, 26, 'powered,unpowered', ''),
(27, 27, 'powered,unpowered', ''),
(28, 28, 'powered,unpowered', ''),
(29, 29, 'powered,unpowered', ''),
(30, 30, 'powered,unpowered', ''),
(31, 31, 'powered,unpowered', ''),
(32, 32, 'powered,unpowered', ''),
(33, 33, 'powered,unpowered', ''),
(34, 34, 'powered,unpowered', ''),
(35, 35, 'powered,unpowered', ''),
(36, 36, 'powered,unpowered', ''),
(37, 37, 'powered,unpowered', ''),
(38, 38, 'powered,unpowered', ''),
(39, 39, 'powered,unpowered', ''),
(40, 40, 'powered,unpowered', ''),
(41, 41, 'powered,unpowered', ''),
(42, 42, 'powered,unpowered', ''),
(43, 43, 'powered,unpowered', ''),
(44, 44, 'powered,unpowered', ''),
(45, 45, 'powered,unpowered', ''),
(46, 46, 'tent', ''),
(47, 47, 'tent', ''),
(48, 48, 'tent', ''),
(49, 49, 'tent', ''),
(50, 50, 'tent', ''),
(51, 51, 'tent', ''),
(52, 52, 'tent', ''),
(53, 53, 'tent', ''),
(54, 54, 'tent', ''),
(55, 55, 'tent', ''),
(56, 56, 'tent', '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

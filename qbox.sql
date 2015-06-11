-- phpMyAdmin SQL Dump
-- version 4.1.12
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2015 at 04:51 AM
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
-- Table structure for table `xtf02_bookings`
--

CREATE TABLE IF NOT EXISTS `xtf02_bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `spot_type` enum('Unpowered','Powered','Tent') NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `booking_type` varchar(20) NOT NULL,
  `country` varchar(50) NOT NULL,
  `number_nights` int(11) NOT NULL,
  `number_people` int(11) NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `check_in_date` datetime NOT NULL,
  `check_out_date` datetime NOT NULL,
  `amount_paid` int(11) NOT NULL,
  `pay_later` bit(1) NOT NULL,
  `registration` varchar(8) NOT NULL,
  `notes` varchar(200) NOT NULL,
  `is_cancelled` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=296 ;

--
-- Dumping data for table `xtf02_bookings`
--

INSERT INTO `xtf02_bookings` (`id`, `spot_type`, `name`, `type`, `booking_type`, `country`, `number_nights`, `number_people`, `make`, `model`, `email`, `phone_number`, `check_in_date`, `check_out_date`, `amount_paid`, `pay_later`, `registration`, `notes`, `is_cancelled`) VALUES
(287, 'Unpowered', 'Test', 'Jucy', 'Booking', 'United Kingdom', 2, 2, '', '', '', '', '2015-03-24 00:00:00', '2015-03-26 00:00:00', 60, b'0', '', '', 0),
(288, 'Unpowered', 'New Booking', '', 'Booking', '', 3, 2, '', '', '', '', '2015-03-24 00:00:00', '2015-03-27 00:00:00', 90, b'0', '', '', 0),
(289, 'Unpowered', '', '', 'Booking', '', 4, 2, '', '', '', '', '2015-03-24 00:00:00', '2015-03-28 00:00:00', 120, b'0', '', '', 0),
(290, 'Unpowered', 'Test Booking', '', 'Booking', '', 3, 2, '', '', '', '', '2015-03-25 00:00:00', '2015-03-28 00:00:00', 90, b'0', '', '', 0),
(291, 'Unpowered', 'Justin Cooper III', '', 'Booking', '', 2, 2, '', '', '', '', '2015-03-25 00:00:00', '2015-03-27 00:00:00', 60, b'0', '', '', 0),
(292, 'Powered', 'Justin Cooper IV', '', 'Booking', '', 1, 2, '', '', '', '', '2015-03-25 00:00:00', '2015-03-26 00:00:00', 35, b'0', '', '', 0),
(293, 'Unpowered', 'Justin Cooper V', '', 'Booking', '', 2, 2, '', '', '', '', '2015-03-25 00:00:00', '2015-03-27 00:00:00', 60, b'0', '', '', 0),
(294, 'Unpowered', 'Justin Cooper', '', 'Booking', '', 1, 2, '', '', '', '', '2015-03-26 00:00:00', '2015-03-27 00:00:00', 0, b'0', '', '', 0),
(295, 'Unpowered', 'Alex Platt', '', 'New Booking', '', 1, 2, '', '', '', '', '2015-03-26 00:00:00', '2015-03-27 00:00:00', 30, b'0', '', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `xtf02_payments`
--

CREATE TABLE IF NOT EXISTS `xtf02_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `payment_amount` decimal(10,0) NOT NULL,
  `payment_type` enum('cash','eftpos') NOT NULL,
  `payment_timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=114 ;

--
-- Dumping data for table `xtf02_payments`
--

INSERT INTO `xtf02_payments` (`id`, `booking_id`, `payment_amount`, `payment_type`, `payment_timestamp`) VALUES
(105, 287, '60', 'cash', '2015-03-23 23:33:46'),
(106, 288, '90', 'cash', '2015-03-24 00:25:56'),
(107, 290, '90', 'cash', '2015-03-24 12:00:44'),
(108, 289, '120', 'eftpos', '2015-03-24 12:59:41'),
(109, 291, '60', 'cash', '2015-03-24 13:17:32'),
(110, 292, '35', 'eftpos', '2015-03-25 00:00:00'),
(111, 293, '30', 'cash', '2015-03-25 00:00:00'),
(112, 293, '30', 'eftpos', '2015-03-25 00:00:00'),
(113, 295, '30', 'cash', '2015-03-26 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `xtf02_spots`
--

CREATE TABLE IF NOT EXISTS `xtf02_spots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `occupied_date` datetime NOT NULL,
  `booking_id` int(11) NOT NULL,
  `type` varchar(9) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=223 ;

--
-- Dumping data for table `xtf02_spots`
--

INSERT INTO `xtf02_spots` (`id`, `number`, `occupied_date`, `booking_id`, `type`) VALUES
(160, 2, '2015-03-24 00:00:00', 287, ''),
(161, 4, '2015-03-25 00:00:00', 287, ''),
(197, 3, '2015-03-24 00:00:00', 288, 'unpowered'),
(198, 3, '2015-03-25 00:00:00', 288, 'unpowered'),
(199, 3, '2015-03-26 00:00:00', 288, 'unpowered'),
(208, 1, '2015-03-26 00:00:00', 290, 'unpowered'),
(209, 1, '2015-03-27 00:00:00', 290, 'unpowered'),
(211, 2, '2015-03-25 00:00:00', 290, 'unpowered'),
(212, 5, '2015-03-24 00:00:00', 289, 'unpowered'),
(213, 5, '2015-03-25 00:00:00', 289, 'unpowered'),
(214, 5, '2015-03-26 00:00:00', 289, 'unpowered'),
(215, 5, '2015-03-27 00:00:00', 289, 'unpowered'),
(216, 6, '2015-03-25 00:00:00', 291, 'unpowered'),
(217, 6, '2015-03-26 00:00:00', 291, 'unpowered'),
(218, 7, '2015-03-25 00:00:00', 292, 'powered'),
(219, 8, '2015-03-25 00:00:00', 293, 'unpowered'),
(220, 8, '2015-03-26 00:00:00', 293, 'unpowered'),
(221, 4, '2015-03-26 00:00:00', 294, 'unpowered'),
(222, 2, '2015-03-26 00:00:00', 295, 'unpowered');

-- --------------------------------------------------------

--
-- Table structure for table `xtf02_spot_configs`
--

CREATE TABLE IF NOT EXISTS `xtf02_spot_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `number` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=57 ;

--
-- Dumping data for table `xtf02_spot_configs`
--

INSERT INTO `xtf02_spot_configs` (`id`, `number`, `type`, `name`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `xtf02_spot_types`
--

CREATE TABLE IF NOT EXISTS `xtf02_spot_types` (
  `type_id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

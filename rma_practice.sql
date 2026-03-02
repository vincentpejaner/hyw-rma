-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2026 at 07:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rma_practice`
--

-- --------------------------------------------------------

--
-- Table structure for table `db_account`
--

CREATE TABLE `db_account` (
  `account_id` int(11) NOT NULL,
  `account_name` varchar(50) NOT NULL,
  `account_username` varchar(50) NOT NULL,
  `account_password` varchar(50) NOT NULL,
  `account_type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `db_account`
--

INSERT INTO `db_account` (`account_id`, `account_name`, `account_username`, `account_password`, `account_type`) VALUES
(1, 'Jason', 'jason@gmail.com', '123', 'admin'),
(2, 'Glendon', 'glendon@gmail.com', '123', 'Client');

-- --------------------------------------------------------

--
-- Table structure for table `db_customer`
--

CREATE TABLE `db_customer` (
  `db_customerid` int(11) NOT NULL,
  `db_fullname` varchar(30) DEFAULT NULL,
  `db_email` varchar(20) DEFAULT NULL,
  `db_phone_number` varchar(13) DEFAULT NULL,
  `F_productid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `db_customer`
--

INSERT INTO `db_customer` (`db_customerid`, `db_fullname`, `db_email`, `db_phone_number`, `F_productid`) VALUES
(3, 'Jason', 'jason@gmail.com', '092345678', 8),
(4, 'Nathaniel Languido', 'languidonathaniel187', '9500520776', 9),
(5, 'adawdw', 'dwad@gmai.com', '9500520776', 10);

-- --------------------------------------------------------

--
-- Table structure for table `db_issue`
--

CREATE TABLE `db_issue` (
  `db_issue_Id` int(11) NOT NULL,
  `db_issue_type` varchar(50) DEFAULT NULL,
  `db_resolution` varchar(50) DEFAULT NULL,
  `db_description` varchar(255) DEFAULT NULL,
  `F_productid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `db_issue`
--

INSERT INTO `db_issue` (`db_issue_Id`, `db_issue_type`, `db_resolution`, `db_description`, `F_productid`) VALUES
(10, 'Damaged', 'Repair', 'haaaaa ah ah ah', 8),
(11, 'Damaged', 'Replace', 'wdadwa', 9),
(12, 'Defective', 'Repair', 'dwadwa', 10);

-- --------------------------------------------------------

--
-- Table structure for table `db_product`
--

CREATE TABLE `db_product` (
  `db_productid` int(11) NOT NULL,
  `db_product_name` varchar(30) DEFAULT NULL,
  `db_serial_number` varchar(50) DEFAULT NULL,
  `db_purchase_date` varchar(15) DEFAULT NULL,
  `db_ticket` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `db_product`
--

INSERT INTO `db_product` (`db_productid`, `db_product_name`, `db_serial_number`, `db_purchase_date`, `db_ticket`) VALUES
(8, 'ramshit', '12478ijh', '2026-02-10', 'fs4WiCSa'),
(9, 'lengvencent', '12312312', '2026-03-03', 'Na8lRfPj'),
(10, 'dwadwdwa', 'dwadad', '2026-03-03', 'xYuJq7Jx');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `db_account`
--
ALTER TABLE `db_account`
  ADD PRIMARY KEY (`account_id`);

--
-- Indexes for table `db_customer`
--
ALTER TABLE `db_customer`
  ADD PRIMARY KEY (`db_customerid`),
  ADD KEY `F_productid` (`F_productid`);

--
-- Indexes for table `db_issue`
--
ALTER TABLE `db_issue`
  ADD PRIMARY KEY (`db_issue_Id`),
  ADD KEY `F_productid` (`F_productid`);

--
-- Indexes for table `db_product`
--
ALTER TABLE `db_product`
  ADD PRIMARY KEY (`db_productid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `db_account`
--
ALTER TABLE `db_account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `db_customer`
--
ALTER TABLE `db_customer`
  MODIFY `db_customerid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `db_issue`
--
ALTER TABLE `db_issue`
  MODIFY `db_issue_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `db_product`
--
ALTER TABLE `db_product`
  MODIFY `db_productid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `db_customer`
--
ALTER TABLE `db_customer`
  ADD CONSTRAINT `db_customer_ibfk_1` FOREIGN KEY (`F_productid`) REFERENCES `db_product` (`db_productid`);

--
-- Constraints for table `db_issue`
--
ALTER TABLE `db_issue`
  ADD CONSTRAINT `db_issue_ibfk_1` FOREIGN KEY (`F_productid`) REFERENCES `db_product` (`db_productid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 23, 2025 at 08:25 AM
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
-- Database: `calculatecalories`
--

-- --------------------------------------------------------

--
-- Table structure for table `calories_data`
--

CREATE TABLE `calories_data` (
  `id` bigint(20) NOT NULL,
  `calories` int(11) NOT NULL,
  `date_time` datetime(6) NOT NULL,
  `food_name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calories_data`
--

INSERT INTO `calories_data` (`id`, `calories`, `date_time`, `food_name`, `price`, `username`) VALUES
(1, 200, '2025-01-02 20:21:06.000000', 'Avocado', 2, 'gio12345'),
(2, 100, '2025-01-02 20:22:14.000000', 'tost', 1, 'gio12345'),
(3, 200, '2025-01-05 17:46:48.000000', 'Avocado', 2, 'gio12345'),
(4, 200, '2025-01-05 17:46:47.000000', 'Avocado', 2, 'gio12345'),
(5, 100, '2025-01-14 08:36:03.000000', 'Avocadoo', 2, 'gio12345'),
(6, 1000, '2025-01-14 08:50:28.000000', 'tost', 123456, 'gio12345'),
(7, 1, '2025-01-14 08:56:40.000000', 'Avocadoo', 12, 'gio12345'),
(8, 200, '2025-01-14 08:59:17.000000', 'Avocado toast', 3, 'georgia123'),
(9, 300, '2025-01-14 08:59:58.000000', 'sandwich', 2, 'georgia123'),
(10, 200, '2025-01-18 08:44:36.000000', 'toast', 1, 'georgia123'),
(11, 2000, '2025-01-18 19:01:01.000000', 'tost', 20, 'georgia123'),
(12, 10000, '2025-01-18 19:01:26.000000', 'Avocado', 12, 'georgia123'),
(13, 5000, '2025-01-19 16:12:22.000000', 'sandwich', 5, 'georgia123');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `first_name`, `last_name`, `password`, `role`, `username`) VALUES
(1, 'prenga.xhorxhia13@gmail.com', 'Xhorxhia', 'Prenga', '$2a$10$RxEykQBRcukWgTSvC0/V/eTDB71/0RpxNCnOxEEZPywWcvAQNhZd6', 'ROLE_USER', 'giogio12345'),
(2, 'test.test@gmail.com', 'Xhorxhia', 'Prenga', '$2a$10$kwz.QXbPRABEAM/2W8a1t.MaISPkIj8t4N7kypbraWfBRBGKDrRa6', 'ROLE_USER', 'gio12345'),
(3, 'georgiaprenga@gmail.com', 'Xhorxhia', 'Prenga', '$2a$10$YKuobSOcNsIC6.ELlbK6c.VRDzy.flC7k8WEa9yY3czaElMZgQIW6', 'ROLE_USER', 'georgia123');

-- --------------------------------------------------------

--
-- Table structure for table `users_roles`
--

CREATE TABLE `users_roles` (
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calories_data`
--
ALTER TABLE `calories_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Indexes for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD KEY `FKt4v0rrweyk393bdgt107vdx0x` (`role_id`),
  ADD KEY `FKgd3iendaoyh04b95ykqise6qh` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calories_data`
--
ALTER TABLE `calories_data`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users_roles`
--
ALTER TABLE `users_roles`
  ADD CONSTRAINT `FKgd3iendaoyh04b95ykqise6qh` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FKt4v0rrweyk393bdgt107vdx0x` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

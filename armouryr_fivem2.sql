-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 08, 2022 at 02:13 AM
-- Server version: 10.3.35-MariaDB-cll-lve
-- PHP Version: 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `armouryr_fivem2`
--

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` int(11) NOT NULL COMMENT 'Unique Business ID',
  `name` varchar(128) NOT NULL COMMENT 'Business Name',
  `owner` varchar(48) NOT NULL DEFAULT 'nobody' COMMENT 'House Business Name',
  `level` int(11) NOT NULL DEFAULT 1 COMMENT 'Business Level',
  `entranceX` double NOT NULL COMMENT 'Entrance Position X',
  `entranceY` double NOT NULL COMMENT 'Entrance Position Y',
  `entranceZ` double NOT NULL COMMENT 'Entrance Position Z',
  `exitX` double NOT NULL COMMENT 'Exit position X',
  `exitY` double NOT NULL COMMENT 'Exit position Y',
  `exitZ` double NOT NULL COMMENT 'Exit position Z',
  `depositX` float NOT NULL COMMENT 'X for business cargo position',
  `depositY` float NOT NULL COMMENT 'Y for business cargo position',
  `depositZ` float NOT NULL COMMENT 'Z for business cargo position',
  `firstPurchasePrice` int(11) NOT NULL COMMENT 'Business Original Value',
  `sellingPrice` int(11) NOT NULL COMMENT 'Business Trading Value (set by player)',
  `partnerIds` varchar(512) NOT NULL COMMENT 'List of Business partners',
  `parent` int(11) NOT NULL COMMENT 'Business Parent Business ID',
  `productPrice` int(11) NOT NULL COMMENT 'Business Product Price'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`id`, `name`, `owner`, `level`, `entranceX`, `entranceY`, `entranceZ`, `exitX`, `exitY`, `exitZ`, `depositX`, `depositY`, `depositZ`, `firstPurchasePrice`, `sellingPrice`, `partnerIds`, `parent`, `productPrice`) VALUES
(1, 'Electricity Company', '', 10, 478.8659362792969, -107.5120849609375, 63.14794921875, 997.4505615234376, -3200.703369140625, -36.4007568359375, 0, 0, 0, 100000, 0, '[]', -1, 0),
(3, 'Electricity Company', '', 10, 478.8527526855469, -107.5120849609375, 63.14794921875, 997.4505615234375, -3200.703369140625, -36.4007568359375, 0, 0, 0, 50000, 0, '[]', -1, 0),
(4, '24/7', '', 5, 26.070331573486328, -1345.7274169921875, 29.4820556640625, 0, 0, 0, 15.6659, -1343.92, 29.2799, 50000, 0, '[]', -1, 0),
(8, '24/7', '', 1, 374.6901245117188, 326.6769104003906, 103.5538330078125, 0, 0, 0, 365.644, 329.789, 103.571, 50000, 0, '[]', -1, 500),
(12, '24/7', '', 1, -3242.914306640625, 1002.11865234375, 12.817626953125, 0, 0, 0, -3248.45, 991.556, 12.4806, 50000, 0, '[]', -1, 500),
(16, '24/7', '', 1, -3040.31201171875, 586.3780517578125, 7.8974609375, 0, 0, 0, -3045.13, 598.84, 7.49304, 50000, 0, '[]', -1, 500),
(19, '24/7', '', 1, 2556.619873046875, 382.8659362792969, 108.6087646484375, 0, 0, 0, 2565.75, 384.752, 108.457, 50000, 0, '[]', -1, 500),
(22, '24/7', '', 1, 547.068115234375, 2670.32958984375, 42.153076171875, 0, 0, 0, 543.178, 2679.05, 42.2205, 50000, 0, '[]', -1, 500),
(25, '24/7', '', 1, 2678.333984375, 3281.5517578125, 55.228515625, 0, 0, 0, 2685.61, 3280.22, 55.2285, 50000, 0, '[]', -1, 500),
(29, '24/7', '', 1, 1961.5384521484373, 3741.81103515625, 32.3297119140625, 0, 0, 0, 1968.86, 3734.41, 32.3297, 50000, 0, '[]', -1, 500),
(30, '24/7', '', 1, 1730.0439453125, 6415.015625, 35.025634765625, 0, 0, 0, 1718.07, 6419.1, 33.3744, 50000, 0, '[]', -1, 500),
(32, '24/7', '', 1, 1162.6944580078125, -323.4725341796875, 69.197021484375, 0, 0, 0, 1153.86, -332.031, 68.8264, 50000, 0, '[]', -1, 500),
(34, '24/7', '', 1, 1136.5845947265625, -981.3758544921876, 46.3992919921875, 0, 0, 0, 1146.84, -980.703, 46.1802, 50000, 0, '[]', -1, 500),
(35, '24/7', '', 1, -48.93626403808594, -1756.773681640625, 29.4146728515625, 0, 0, 0, -52.3253, -1761.05, 29.0945, 50000, 0, '[]', -1, 500),
(39, '24/7', '', 1, -708.5010986328125, -913.9912109375, 19.20361328125, 0, 0, 0, -718.418, -921.152, 19.0015, 50000, 0, '[]', -1, 500),
(42, '24/7', '', 1, -1224.03955078125, -906.8043823242188, 12.3121337890625, 0, 0, 0, -1229.46, -898.141, 12.2784, 50000, 0, '[]', -1, 500),
(45, '24/7', '', 1, -1487.4989013671875, -380.5186767578125, 40.14794921875, 0, 0, 0, -1505.1, -384.976, 40.5861, 50000, 0, '[]', -1, 500),
(48, '24/7', '', 1, -1821.2572021484373, 792.1978149414062, 138.129638671875, 0, 0, 0, -1824.61, 780.712, 137.944, 50000, 0, '[]', -1, 500);

-- --------------------------------------------------------

--
-- Table structure for table `dealerships`
--

CREATE TABLE `dealerships` (
  `id` int(11) NOT NULL,
  `title` varchar(64) NOT NULL DEFAULT '',
  `entranceX` float NOT NULL,
  `entranceY` float NOT NULL,
  `entranceZ` float NOT NULL,
  `exitX` float NOT NULL,
  `exitY` float NOT NULL,
  `exitZ` float NOT NULL,
  `blipId` int(11) NOT NULL,
  `markerId` int(11) NOT NULL,
  `vehicles` varchar(4096) NOT NULL DEFAULT '{}',
  `viewVehiclePosX` float NOT NULL,
  `viewVehiclePosY` float NOT NULL,
  `viewVehiclePosZ` float NOT NULL,
  `viewVehiclePosH` float NOT NULL,
  `viewCameraPosX` float NOT NULL,
  `viewCameraPosY` float NOT NULL,
  `viewCameraPosZ` float NOT NULL,
  `buySpawnX` float NOT NULL,
  `buySpawnY` float NOT NULL,
  `buySpawnZ` float NOT NULL,
  `buySpawnH` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `dealerships`
--

INSERT INTO `dealerships` (`id`, `title`, `entranceX`, `entranceY`, `entranceZ`, `exitX`, `exitY`, `exitZ`, `blipId`, `markerId`, `vehicles`, `viewVehiclePosX`, `viewVehiclePosY`, `viewVehiclePosZ`, `viewVehiclePosH`, `viewCameraPosX`, `viewCameraPosY`, `viewCameraPosZ`, `buySpawnX`, `buySpawnY`, `buySpawnZ`, `buySpawnH`) VALUES
(1, 'Used and Refurbished', -29.3685, -1103.76, 26.4224, 0, 0, 0, 530, 36, '{\"501624666\":{\"brand\":\"Ferrari\",\"description\":\"612 Scaglietti, 2004\",\"price\":2500000,\"stock\":0},\"713033162\":{\"brand\":\"Honda\",\"description\":\"CR-X Del Sol, 1997\",\"price\":2500000,\"stock\":4},\"743945900\":{\"brand\":\"Toyota\",\"description\":\"Celica Supra MKII, 1984\",\"price\":2500000,\"stock\":0},\"1032823388\":{\"brand\":\"Audi\",\"description\":\"R8, 2018\",\"price\":2500000,\"stock\":0},\"1075644339\":{\"brand\":\"Porsche\",\"description\":\"911 Carrera S, 2018\",\"price\":2500000,\"stock\":0},\"1136899243\":{\"brand\":\"Toyota\",\"description\":\"MR-2 GT SW-20, 1991\",\"price\":2500000,\"stock\":0},\"1269098716\":{\"brand\":\"Toyota\",\"description\":\"LandCruiser Prado, 2009\",\"price\":1250000,\"stock\":0},\"1323801920\":{\"brand\":\"Subaru\",\"description\":\"Legacy 2.0 GT B4, 2005\",\"price\":2500000,\"stock\":0},\"1346649796\":{\"brand\":\"Chevrolet\",\"description\":\"Camaro ZL1, 2017\",\"price\":2500000,\"stock\":1},\"1411828323\":{\"brand\":\"Subaru\",\"description\":\"BRZ, 2013\",\"price\":2500000,\"stock\":1},\"1468283893\":{\"brand\":\"Lexus\",\"description\":\"LFA, 2010\",\"price\":2500000,\"stock\":1},\"1675900823\":{\"brand\":\"Nissan\",\"description\":\"GTR R35, 2017\",\"price\":2500000,\"stock\":1},\"2057197469\":{\"brand\":\"BMW\",\"description\":\"M635 CSi, 1986\",\"price\":2500000,\"stock\":1},\"2093958905\":{\"brand\":\"Mercedes\",\"description\":\"SLS AMG, 2011\",\"price\":2500000,\"stock\":1},\"2103714784\":{\"brand\":\"Chevrolet\",\"description\":\"Camaro ZL1, 2018\",\"price\":2500000,\"stock\":1},\"-352601093\":{\"brand\":\"Pontiac\",\"description\":\"Firebird, 1968\",\"price\":2500000,\"stock\":1},\"-1649486986\":{\"brand\":\"Chevrolet\",\"description\":\"Nova, 1969\",\"price\":2500000,\"stock\":1},\"-1560535803\":{\"brand\":\"BMW\",\"description\":\"507 2.0, 1959\",\"price\":2500000,\"stock\":1},\"-950419134\":{\"brand\":\"BMW\",\"description\":\"M5 E60, 2008\",\"price\":2500000,\"stock\":1},\"-289433737\":{\"brand\":\"Chrysler\",\"description\":\"Crossfire, 2004\",\"price\":2500000,\"stock\":1},\"-1458068960\":{\"brand\":\"Chevrolet\",\"description\":\"Cobalt SS, 2006\",\"price\":2500000,\"stock\":1},\"-394074634\":{\"brand\":\"Mercedes\",\"description\":\"G AMG 2015\",\"price\":2500000,\"stock\":1},\"-1532987787\":{\"brand\":\"Ford\",\"description\":\"Mustang Shelby GT500, 2020\",\"price\":2500000,\"stock\":1},\"-1837978521\":{\"brand\":\"Mitsubishi\",\"description\":\"FTO GP Version-R, 1997\",\"price\":2500000,\"stock\":1},\"-1544609746\":{\"brand\":\"Lexus\",\"description\":\"SC 430 ZC40, 2001\",\"price\":2500000,\"stock\":1},\"-1690810910\":{\"brand\":\"Mercedes\",\"description\":\"560SEL w126, 1990\",\"price\":2500000,\"stock\":1},\"-890116447\":{\"brand\":\"Nissan\",\"description\":\"Skyline GTS-R R31, 1989\",\"price\":2500000,\"stock\":1},\"-1145832972\":{\"brand\":\"Porsche\",\"description\":\"Carrera GT 980, 2003\",\"price\":2500000,\"stock\":1},\"-1390169318\":{\"brand\":\"Nissan\",\"description\":\"Silvia S15 Spec-R, 1999\",\"price\":2500000,\"stock\":0},\"-1403128555\":{\"brand\":\"Lamborghini\",\"description\":\"Aventador LP700-4, 2013\",\"price\":2500000,\"stock\":0}}', 978.754, -3002.2, -40.0334, 228.22, 986.7, -3002.4, -39.6469, -47.7986, -1116.32, 26.0054, 2.46852);

-- --------------------------------------------------------

--
-- Table structure for table `factions`
--

CREATE TABLE `factions` (
  `id` int(11) NOT NULL,
  `internalId` varchar(16) NOT NULL,
  `blipId` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `entranceX` double NOT NULL,
  `entranceY` double NOT NULL,
  `entranceZ` double NOT NULL,
  `exitX` double NOT NULL,
  `exitY` double NOT NULL,
  `exitZ` double NOT NULL,
  `members` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `factions`
--

INSERT INTO `factions` (`id`, `internalId`, `blipId`, `name`, `entranceX`, `entranceY`, `entranceZ`, `exitX`, `exitY`, `exitZ`, `members`) VALUES
(1, 'taxi', 198, 'Taxi Cab Company', 435.6214294433594, -647.3629150390625, 28.73869323730468, 1173.4207763671875, -3196.65283203125, -39.0079460144043, '[{\"id\":1,\"rank\":1},{\"id\":54,\"rank\":6},{\"id\":38,\"rank\":6},{\"id\":57,\"rank\":6},{\"id\":59,\"rank\":6}]'),
(3, 'police', -1, 'Police Department', 639.1384887695312, 1.7142858505249023, 82.778076171875, 0, 0, 0, '[{\"id\":1,\"rank\":6}]');

-- --------------------------------------------------------

--
-- Table structure for table `houses`
--

CREATE TABLE `houses` (
  `id` int(11) NOT NULL COMMENT 'Unique House ID',
  `owner` varchar(48) NOT NULL DEFAULT 'nobody' COMMENT 'House Owner Name',
  `level` int(11) NOT NULL DEFAULT 1 COMMENT 'House Level',
  `entranceX` double NOT NULL COMMENT 'Entrance Position X',
  `entranceY` double NOT NULL COMMENT 'Entrance Position Y',
  `entranceZ` double NOT NULL COMMENT 'Entrance Position Z',
  `exitX` double NOT NULL COMMENT 'Exit position X',
  `exitY` double NOT NULL COMMENT 'Exit position Y',
  `exitZ` double NOT NULL COMMENT 'Exit position Z',
  `firstPurchasePrice` int(11) NOT NULL COMMENT 'House Original Value',
  `sellingPrice` int(11) NOT NULL COMMENT 'House Trading Value (set by player)',
  `rentPrice` int(11) NOT NULL COMMENT 'Price of the Rent',
  `tenantIds` varchar(512) NOT NULL COMMENT 'List of House tenants',
  `pet` varchar(2048) NOT NULL DEFAULT '{}',
  `fridge` varchar(2048) NOT NULL DEFAULT '{}'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `houses`
--

INSERT INTO `houses` (`id`, `owner`, `level`, `entranceX`, `entranceY`, `entranceZ`, `exitX`, `exitY`, `exitZ`, `firstPurchasePrice`, `sellingPrice`, `rentPrice`, `tenantIds`, `pet`, `fridge`) VALUES
(9, '', 1, 141.36264038085938, -279.3362731933594, 46.2982177734375, 346.5362548828125, -1012.4703369140624, -99.216796875, 0, 10000, 500, '[2,38,1]', '{}', '{}'),
(52, '', 1, 173.27471923828125, -279.99560546875, 46.146484375, 346.5362548828125, -1012.4703369140624, -99.216796875, 1000000, 3971191, 98, '[]', '{\"name\":\"Chop\",\"pedId\":\"a_c_cat_01\"}', '{\"cold_coffee\":1,\"sandwich\":3,\"rum\":10,\"champagne\":50,\"coke\":19}'),
(53, '', 1, 180.5802154541016, -283.054931640625, 50.2747802734375, 346.5362548828125, -1012.4703369140624, -99.216796875, 1000000, 10000, 100, '[2,38]', '{\"name\":\"Chop\",\"pedId\":\"a_c_chop\"}', '{}'),
(54, '', 1, 174.1977996826172, -273.3494567871094, 46.146484375, 346.5362548828125, -1012.4703369140625, -99.216796875, 1, 0, 0, '[2,1,38]', '{\"name\":\"Chop\",\"pedId\":\"a_c_chop\"}', '{}'),
(55, '', 1, 148.73406982421875, -264.5010986328125, 46.2982177734375, 346.5362548828125, -1012.4703369140625, -99.216796875, 1, 0, 0, '[2,1,38]', '{\"name\":\"Chop\",\"pedId\":\"a_c_chop\"}', '{}'),
(57, '', 1, 172.984619140625, -280.21978759765625, 50.2747802734375, 346.5362548828125, -1012.4703369140625, -99.216796875, 1, 0, 0, '[]', '{}', '{}'),
(58, '', 1, 142.984619140625, -280.4307556152344, 50.4432373046875, 266.0835266113281, -1007.3274536132812, -101.019775390625, 100000, 0, 0, '[]', '{}', '{}');

-- --------------------------------------------------------

--
-- Table structure for table `phone_contacts`
--

CREATE TABLE `phone_contacts` (
  `id` int(11) NOT NULL COMMENT 'Phone Number',
  `contacts` varchar(1280) NOT NULL DEFAULT '[]'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL COMMENT 'Unique Player ID',
  `name` varchar(48) NOT NULL DEFAULT '' COMMENT 'Unique Player Name',
  `password` varchar(129) NOT NULL COMMENT 'Whirlpool hash for password',
  `email` varchar(321) NOT NULL COMMENT 'Unique Player Email',
  `experience` bigint(64) NOT NULL DEFAULT 0,
  `cash` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Player Cash (not in bank)',
  `bank` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Player Bank Account Money',
  `hoursPlayed` float NOT NULL DEFAULT 0,
  `job` varchar(48) NOT NULL DEFAULT '' COMMENT 'Player Job Name',
  `phone` bigint(11) NOT NULL DEFAULT -1,
  `skills` varchar(1024) NOT NULL DEFAULT '[]',
  `weapons` varchar(1024) NOT NULL DEFAULT '{}' COMMENT 'JSON of player weapons',
  `drugs` varchar(256) NOT NULL DEFAULT '{}',
  `items` varchar(2048) NOT NULL DEFAULT '{}',
  `hunger` int(11) NOT NULL DEFAULT 100,
  `thirst` int(11) NOT NULL DEFAULT 100,
  `jailTime` int(11) NOT NULL DEFAULT 0,
  `wantedLevel` int(11) NOT NULL DEFAULT 0,
  `lastLocation` varchar(256) NOT NULL DEFAULT '[]',
  `adminLevel` int(11) NOT NULL DEFAULT 0 COMMENT 'Player''s Admin Level',
  `xp` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `modelHash` bigint(20) NOT NULL DEFAULT 1269098716,
  `owner` int(11) NOT NULL DEFAULT 0,
  `primaryColor` int(11) NOT NULL DEFAULT 0,
  `secondaryColor` int(11) NOT NULL DEFAULT 0,
  `posX` float NOT NULL,
  `posY` float NOT NULL,
  `posZ` float NOT NULL,
  `posH` float NOT NULL,
  `plate` varchar(32) NOT NULL DEFAULT 'ARMOURY',
  `items` varchar(2048) NOT NULL DEFAULT '[]'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `dealerships`
--
ALTER TABLE `dealerships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `factions`
--
ALTER TABLE `factions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `houses`
--
ALTER TABLE `houses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `phone_contacts`
--
ALTER TABLE `phone_contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique Business ID', AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `dealerships`
--
ALTER TABLE `dealerships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `factions`
--
ALTER TABLE `factions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `houses`
--
ALTER TABLE `houses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique House ID', AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Unique Player ID';

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE TABLE `accepted_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `address` varchar(42) NOT NULL,
  `decimals` int NOT NULL DEFAULT '18',
  `pool_address` varchar(42) NOT NULL,
  `pool_name` varchar(100) NOT NULL,
  `pool_symbol` varchar(20) NOT NULL,
  `pool_decimals` int NOT NULL DEFAULT '18',
  `active` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `symbol_UNIQUE` (`symbol`),
  UNIQUE KEY `address_UNIQUE` (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

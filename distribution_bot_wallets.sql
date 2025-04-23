
CREATE TABLE `distribution_bot_wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `distribution_bot_uuid` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `wallet_address` varchar(42) NOT NULL,
  `percent` double NOT NULL DEFAULT '100',
  `active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
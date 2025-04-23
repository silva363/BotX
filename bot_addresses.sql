CREATE TABLE `bot_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot_uuid` varchar(36) NOT NULL,
  `account_private_key` varchar(255) NOT NULL,
  `friendly_name` varchar(255) DEFAULT NULL,
  `destiny_address` varchar(42) NOT NULL,
  `destiny_friendly_name` varchar(255) DEFAULT NULL,
  `token_name` varchar(100) NOT NULL,
  `token_symbol` varchar(20) NOT NULL,
  `token_address` varchar(42) NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `spent_balance` decimal(30,18) NOT NULL DEFAULT '0.000000000000000000',
  `airdrop_time` int NOT NULL DEFAULT '60',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

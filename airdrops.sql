CREATE TABLE `airdrops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bot_execution` int DEFAULT NULL,
  `private_key` varchar(255) NOT NULL,
  `amount` decimal(30,18) NOT NULL,
  `token_symbol` varchar(20) NOT NULL,
  `token_address` varchar(42) NOT NULL,
  `destiny_address` varchar(42) NOT NULL,
  `delay_to_start` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `swaps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bot_execution` int DEFAULT NULL,
  `bot_uuid` varchar(36) NOT NULL,
  `private_key` varchar(255) NOT NULL,
  `amount` decimal(30,18) NOT NULL,
  `token_name` varchar(100) NOT NULL,
  `token_symbol` varchar(20) NOT NULL,
  `token_address` varchar(42) NOT NULL,
  `swap_type` varchar(10) NOT NULL,
  `bot_type` varchar(20) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

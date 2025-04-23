CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction` int NOT NULL,
  `private_key` varchar(255) NOT NULL,
  `token_symbol` varchar(20) NOT NULL,
  `amount` decimal(30,18) NOT NULL,
  `type` varchar(255) NOT NULL,
  `refund_address` varchar(42),
  `refund` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

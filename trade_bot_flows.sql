CREATE TABLE `trade_bot_flows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trade_bot` int NOT NULL,
  `bot_execution` int NOT NULL,
  `flow` int NOT NULL DEFAULT '1',
  `actual_cycle` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_trade_bot_flow_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

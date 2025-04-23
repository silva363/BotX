CREATE TABLE `bot_executions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bot` int DEFAULT NULL,
  `trade_bot` int DEFAULT NULL,
  `distribution_bot` int DEFAULT NULL,
  `seed_bot` int DEFAULT NULL,
  `volume_bot` int DEFAULT NULL,
  `execution_time` int NOT NULL DEFAULT '1',
  `active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




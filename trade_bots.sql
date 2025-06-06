CREATE TABLE `trade_bots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `helper_private_key` varchar(255) NOT NULL,
  `account_private_key` varchar(255) NOT NULL,
  `account_friendly_name` varchar(255) DEFAULT NULL,
  `destiny_address` varchar(42) NOT NULL,
  `destiny_friendly_name` varchar(255) DEFAULT NULL,
  `token_name` varchar(100) NOT NULL,
  `token_symbol` varchar(20) NOT NULL,
  `token_address` varchar(42) NOT NULL,
  `target_price` float NOT NULL,
  `min_amount` float NOT NULL,
  `max_amount` float NOT NULL,
  `min_delay` int NOT NULL,
  `max_delay` int NOT NULL,
  `target_balance` float NOT NULL DEFAULT '0',
  `spent_balance` decimal(30,18) NOT NULL DEFAULT '0.000000000000000000',
  `holder_percent` float NOT NULL DEFAULT '0',
  `slippage_tolerance` double NOT NULL DEFAULT '5',
  `delay_to_start` int NOT NULL DEFAULT '0',
  `strategy` varchar(4) NOT NULL,
  `cycles` int NOT NULL DEFAULT '1',
  `cycle_delay` int NOT NULL DEFAULT '60',
  `cycle_ghosts` int NOT NULL DEFAULT '5',
  `work_start` varchar(5) NOT NULL DEFAULT '00:00',
  `work_end` varchar(5) NOT NULL DEFAULT '00:00',
  `airdrop_time` int NOT NULL DEFAULT '60',
  `actual_cycle` int NOT NULL DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '0',
  `is_hidden` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`uuid`),
  UNIQUE KEY `id_trade_bot_UNIQUE` (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

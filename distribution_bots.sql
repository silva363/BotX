
CREATE TABLE `distribution_bots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token_symbol` varchar(45) NOT NULL,
  `account_private_key` varchar(255) NOT NULL,
  `account_friendly_name` varchar(255) DEFAULT NULL,
  `delay` int NOT NULL DEFAULT '300',
  `active` tinyint NOT NULL DEFAULT '0',
  `is_hidden` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`uuid`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
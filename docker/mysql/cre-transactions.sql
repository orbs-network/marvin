CREATE TABLE `transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `durationMillis` int(11) DEFAULT NULL,
  `txResult` varchar(255) DEFAULT NULL,
  `rr_createdate` datetime DEFAULT NULL,
  `rr_createdate_unix` int(11) DEFAULT NULL,
  `blockHeight` int(11) DEFAULT NULL,
  `txId` varchar(255) DEFAULT NULL,
  `papiUrl` varchar(1000) DEFAULT '',
  `vchain` int(10) unsigned DEFAULT NULL,
  `commitHash` varchar(40) DEFAULT NULL,
  `version` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2933467 DEFAULT CHARSET=latin1;
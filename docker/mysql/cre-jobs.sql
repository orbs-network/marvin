CREATE TABLE `jobs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `running` tinyint(1) NOT NULL DEFAULT '0',
  `job_start` datetime DEFAULT NULL,
  `job_end` datetime DEFAULT NULL,
  `total_tx_count` int(11) NOT NULL,
  `err_tx_count` int(11) NOT NULL,
  `tx_per_minute` float DEFAULT NULL,
  `expected_duration_sec` int(11) DEFAULT NULL,
  `tx_response_max` int(11) DEFAULT NULL,
  `tx_response_p99` int(11) DEFAULT NULL,
  `tx_response_p95` int(11) DEFAULT NULL,
  `tx_response_median` int(11) DEFAULT NULL,
  `tx_response_avg` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
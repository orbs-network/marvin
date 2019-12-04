CREATE TABLE `jobs`
(
    `id`                    int(11) unsigned NOT NULL AUTO_INCREMENT,
    `name`                  varchar(100)              DEFAULT NULL,
    `vchain`                varchar(50)               DEFAULT NULL,
    `branch`                varchar(100)              DEFAULT NULL,
    `status`                varchar(11)               DEFAULT NULL,
    `running`               tinyint(1)       NOT NULL DEFAULT '0',
    `job_start`             datetime                  DEFAULT NULL,
    `job_end`               datetime                  DEFAULT NULL,
    `expected_duration_sec` int(11)                   DEFAULT NULL,
    `tx_per_minute`         float                     DEFAULT NULL,
    `total_tx_count`        int(11)          NOT NULL,
    `err_tx_count`          int(11)          NOT NULL,
    `tx_response_max`       int(11)                   DEFAULT NULL,
    `tx_response_p99`       int(11)                   DEFAULT NULL,
    `tx_response_p95`       int(11)                   DEFAULT NULL,
    `tx_response_p90`       int(11)                   DEFAULT NULL,
    `tx_response_median`    int(11)                   DEFAULT NULL,
    `tx_response_avg`       int(11)                   DEFAULT NULL,
    `tx_response_stddev`    float                     DEFAULT NULL,
    `semantic_version`      varchar(50)               DEFAULT NULL,
    `commit_hash`           varchar(50)               DEFAULT NULL,
    `error`                 varchar(100)              DEFAULT NULL,
    `comment`               varchar(100)              DEFAULT NULL,
    `results`               text,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 60
  DEFAULT CHARSET = latin1;
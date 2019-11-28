CREATE TABLE `events`
(
    `id`               int(11) unsigned NOT NULL AUTO_INCREMENT,
    `event_start`      datetime         NOT NULL,
    `event_end`        datetime     DEFAULT NULL,
    `vchain`           varchar(50)  DEFAULT '',
    `description`      varchar(200) DEFAULT '',
    `tag1`             varchar(100) DEFAULT '',
    `tag2`             varchar(100) DEFAULT '',
    `semantic_version` varchar(50)  DEFAULT '',
    `commit_hash`      varchar(50)  DEFAULT '',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = latin1;
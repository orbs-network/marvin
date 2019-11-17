CREATE TABLE `events`
(
    `id`          int(11) unsigned NOT NULL AUTO_INCREMENT,
    `event_start` datetime         NOT NULL,
    `event_end`   datetime     DEFAULT NULL,
    `vchain`      varchar(50)  DEFAULT NULL,
    `description` varchar(200) DEFAULT NULL,
    `tag1`        varchar(16)  DEFAULT NULL,
    `tag2`        varchar(16)  DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 1
  DEFAULT CHARSET = latin1;
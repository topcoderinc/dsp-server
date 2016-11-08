/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Module to generate test data
 *
 * @author      TSCCODER
 * @version     1.0
 */

require('./bootstrap');
const Drone = require('./models').Drone;
const logger = require('./common/logger');
const drones = require('./data/drones.json');

// players json data
const co = require('co');

co(function* () {
  logger.info('deleting previous data');
  yield Drone.remove({ });
  logger.info(`creating ${drones.length} drones`);
  yield Drone.create(drones);
  logger.info('drones created successfully');
}).then(() => {
  logger.info('Done');
  process.exit();
}).catch((e) => {
  logger.error(e);
  process.exit();
});

/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Use this script to generate many drones for performance tests.
 * Only `Drone` model is overridden.
 *
 * @author      TSCCODER
 * @version     1.0
 */

require('./bootstrap');
const _ = require('lodash');
const logger = require('./common/logger');
const models = require('./models');
const geolib = require('geolib');
const DroneStatus = require('./enum').DroneStatus;

/*
 * Total number of drones is NUM_DRONES_ROW x NUM_DRONES_COL
 * Location of drones is fixed using following pattern
 *
 * x -> x -> x -> x
 * x -> x -> x -> x
 *
 * -> means 100m distance (STEP_METERS)
 * distance between rows is also 100m
 * All drones create a "grid"
 *
 */
const NUM_DRONES_ROW = 100;
const NUM_DRONES_COL = 100;

const STEP_METERS = 100;

// position of left-top drone
const START_POSITION = [-77.042575, 38.896719];

// right direction
const COL_BEARING = 90;

// down direction
const ROW_BEARING = 180;

const Drone = models.Drone;
// players json data
const co = require('co');

co(function*() {
  logger.info('deleting previous data');
  yield Drone.remove({});

  const drones = [];
  _.range(0, NUM_DRONES_ROW).forEach((row) => {
    const rowStart = geolib.computeDestinationPoint(START_POSITION, row * STEP_METERS, ROW_BEARING);
    _.range(0, NUM_DRONES_COL).forEach((col) => {
      const dronePosition = geolib.computeDestinationPoint(rowStart, col * STEP_METERS, COL_BEARING);
      const number = row * NUM_DRONES_ROW + col + 1;
      const serialNumber = _.padStart(number, 5, '0');
      const drone = {
        _id: _.padEnd('1', 19, '0') + serialNumber, // id must have 24 characters
        name: `D ${number} (${row + 1}:${col + 1})`,
        currentLocation: [dronePosition.longitude, dronePosition.latitude],
        serialNumber,
        status: DroneStatus.IN_MOTIONS,
      };
      drones.push(drone);
    });
  });
  logger.info(`Creating ${drones.length} drones`);
  yield Drone.create(drones);

  logger.info('data created successfully');
}).then(() => {
  logger.info('Done');
  process.exit();
}).catch((e) => {
  logger.error(e);
  process.exit();
});

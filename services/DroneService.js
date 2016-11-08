/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Drone module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');

const models = require('../models');

const Drone = models.Drone;
const helper = require('../common/helper');
const errors = require('common-errors');

const DronePosition = models.DronePosition;

const _ = require('lodash');

// Exports
module.exports = {
  create,
  update,
  getAll,
};

// the joi schema for create
create.schema = {
  entity: joi.object().keys({
    lat: joi.number().required(),
    lng: joi.number().required(),
    status: joi.string().allow(['idle-ready', 'idle-busy', 'in-motion']).required(),
    name: joi.string().required(),
  }).required(),
};

/**
 * Create a drone in the system.
 * This will push the stream to kafka, kafka workers should than process actual create
 * and pushing the update to the map in realtime via socket connection
 * NOTE: Implementation should make sure that this method must return as fast as possible
 * since the load will be very heavy at any time.
 *
 * @param {Object}    entity          the parsed request body
 */
function* create(entity) {
  const created = yield Drone.create(entity);
  return created.toObject();
}

// the joi schema for update
update.schema = {
  id: joi.string().required(),
  entity: joi.object().keys({
    lat: joi.number().required(),
    lng: joi.number().required(),
  }).required(),
};

/**
 * Update a drone position/status in the system
 * This will push the stream to kafka, kafka workers should than process actual update
 * and pushing the update to the map in realtime via socket connection
 * NOTE: Implementation should make sure that this method must return as fast as possible
 * since the load will be very heavy at any time.
 *
 * @param {String}    id              the id of the drone to update
 * @param {Object}    entity          the parsed request body
 */
function* update(id, entity) {
  // update the position history
  const drone = yield Drone.findOne({ _id: id });
  if (!drone) {
    throw new errors.NotFoundError(`drone not found with specified id ${id}`);
  }

  const position = {
    droneId: drone._id,
    lat: drone.lat,
    lng: drone.lng,
  };

  yield DronePosition.create(position);

  _.extend(drone, entity);

  yield drone.save();

  return drone.toObject();
}

/**
 * Get a list of all the drones
 */
function* getAll() {
  const docs = yield Drone.find({ });
  return helper.sanitizeArray(docs);
}


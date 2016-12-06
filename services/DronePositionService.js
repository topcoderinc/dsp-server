/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * DronePosition module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const errors = require('common-errors');
const helper = require('../common/helper');
const models = require('../models');

const Drone = models.Drone;
const DronePosition = models.DronePosition;

// Exports
module.exports = {
  getPositions,
};

// the joi schema for getPositions
getPositions.schema = {
  id: joi.string().required(),
  query: joi.object().keys({
    limit: joi.number().integer().min(1).required(),
    offset: joi.number().integer().min(0),
  }).required(),
};

/**
 * Get a list of positions of a drone
 * @param {String}    id              the id of the drone
 */
function* getPositions(id, query) {
  helper.validateObjectId(id);
  const drone = yield Drone.findOne({ _id: id });
  if (!drone) {
    throw new errors.NotFoundError(`drone not found with specified id ${id}`);
  }
  const total = yield DronePosition.find({ droneId: id }).count();
  const docs = yield DronePosition.find({ droneId: id }).sort({ createdAt: -1 }).skip(query.offset || 0).limit(query.limit);
  return {
    total,
    items: helper.sanitizeArray(docs),
  };
}

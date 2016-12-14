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
const DroneStatus = require('../enum').DroneStatus;
const DroneType = require('../enum').DroneType;
const ProviderService = require('./ProviderService');

const _ = require('lodash');

// Exports
module.exports = {
  create,
  update,
  getAll,
  getAllByProvider,
  currentLocations,
  deleteSingle,
  getSingle,
  updateLocation,
};


const droneCreateorUpdateEntityJoi = joi.object().keys({
  id: joi.string(),
  deviceId: joi.string(),
  serialNumber: joi.string().required(),
  name: joi.string().required(),
  type: joi.string().valid(_.values(DroneType)).required(),
  minSpeed: joi.number(),
  maxSpeed: joi.number(),
  maxFlightTime: joi.number(),
  maxCargoWeight: joi.number(),
  maxAltitude: joi.number(),
  cameraResolution: joi.number(),
  videoResolution: joi.number(),
  hasWiFi: joi.boolean(),
  hasBluetooth: joi.boolean(),
  engineType: joi.string(),
  numberOfRotors: joi.number().integer(),
  hasAccelerometer: joi.boolean(),
  hasGyroscope: joi.boolean(),
  hasRadar: joi.boolean(),
  hasGPS: joi.boolean(),
  hasObstacleSensors: joi.boolean(),
  hasUltraSonicAltimeter: joi.boolean(),
  imageUrl: joi.string(),
  mileage: joi.number(),
  status: joi.string().valid(_.values(DroneStatus)),
  specificationContent: joi.string(),
  specificationImageUrl: joi.string(),
  specificationPDFUrl: joi.string(),
}).required();

// the joi schema for create
create.schema = {
  providerId: joi.string().required(),
  entity: droneCreateorUpdateEntityJoi,
};

/**
 * Create a drone , only use by provider
 * @param providerId the providerId
 * @param {Object} entity the parsed request body
 */
function* create(providerId, entity) {
  if (!entity.status) {
    entity.status = DroneStatus.IDLE_READY;
  }

  entity.provider = providerId;
  const created = yield Drone.create(entity);
  return created.toObject();
}


/* NOTE: any field can but updated (lat,ln,status,deviceId) so I removed the require()
for security we will take out the hardwareId that can only be created never update */

update.schema = {
  providerId: joi.string().required(),
  id: joi.string().required(),
  entity: droneCreateorUpdateEntityJoi,
};

/**
 *
 * @param providerId
 * @param id
 * @param entity
 */
function* update(providerId, id, entity) {
  const drone = yield Drone.findOne({_id: id});
  if (!drone) {
    throw new errors.NotFoundError(`Current logged in provider does not have this drone , id = ${id}`);
  }
  if (drone.provider.toString() !== providerId) {
    throw new errors.NotPermittedError('Current logged in provider does not have permission');
  }
  _.extend(drone, entity);
  yield drone.save();
  return drone.toObject();
}


const getAllEntitySchema = joi.object().keys({
  offset: joi.number().integer(),
  limit: joi.number().integer(),
  statuses: joi.array().items(joi.string().valid(_.values(DroneStatus))),
  sortBy: joi.string().valid(['serialNumber', 'name', 'type', 'mileage',
    '-serialNumber', '-name', '-type', '-mileage']),
}).required();

getAllByProvider.schema = {
  providerId: joi.string(),
  entity: getAllEntitySchema,
};
/**
 *
 * @param providerId
 * @param entity
 */
function* getAllByProvider(providerId, entity) {
  return yield _getAll(providerId, entity);
}


getAll.schema = {
  providerId: joi.string(),
  entity: getAllEntitySchema,
};
/**
 * Get a list of all the drones
 */
function* getAll(entity) {
  return yield _getAll(null, entity);
}

/**
 * private get all drones
 * @param providerId
 * @param entity
 * @return {{total: *, items: *}}
 * @private
 */
function * _getAll(providerId, entity) {
  const criteria = {};
  if (!_.isNil(entity.statuses)) {
    criteria.status = {$in: entity.statuses};
  }
  if (!_.isNil(providerId)) {
    criteria.provider = providerId;
  }

  const sortBy = {};
  if (!_.isNil(entity.sortBy)) {
    const name = entity.sortBy[0] === '-' ? entity.sortBy.substr(1) : entity.sortBy;
    const value = entity.sortBy[0] === '-' ? -1 : 1;
    sortBy[name] = value;
  }

  const docs = yield Drone.find(criteria).sort(sortBy).skip(entity.offset || 0).limit(entity.limit || 1000);
  return {
    total: yield Drone.find(criteria).count(),
    items: _.map(docs, (d) => _.pick(d, 'id', 'imageUrl', 'status','thumbnailUrl', 'deviceId', 'serialNumber', 'name', 'type',
      'mileage', 'minSpeed', 'maxSpeed', 'maxFlightTime', 'maxCargoWeight','currentLocation')),
  };
}

/**
 * get drone current locations by provider
 * @param providerId
 */
function* currentLocations(providerId) {
  const docs = yield Drone.find({provider: providerId});
  return _.map(docs, (d) => _.pick(d, 'status', 'currentLocation'));
}

/**
 * delete drone by id
 * if drone dont belongs provider . it will raise a exception
 * @param id
 */
function* deleteSingle(providerId, id) {
  const drone = yield Drone.findOne({_id: id});
  if (!drone) {
    throw new errors.NotFoundError(`Current logged in provider does not have this drone , id = ${id}`);
  }

  if (drone.provider.toString() !== providerId) {
    throw new errors.NotPermittedError('Current logged in provider does not have permission');
  }

  yield drone.remove();
}

/**
 * get single by id
 * @param id
 */
function *getSingle(id) {
  const drone = yield Drone.findOne({_id: id});
  if (!drone) {
    throw new errors.NotFoundError(`Current logged in provider does not have this drone , id = ${id}`);
  }
  return drone.toObject();
}


updateLocation.schema = {
  id: joi.string().required(),
  entity: joi.object().keys({
    lat: joi.number().required(),
    lng: joi.number().required(),
  }).required()
};

/**
 * update a drone location
 * @param id
 * @param entity
 */
function *updateLocation(id, entity) {
  const drone = yield Drone.findOne({_id: id});
  if (!drone) {
    throw new errors.NotFoundError(`Current logged in provider does not have this drone , id = ${id}`);
  }

  drone.currentLocation = [entity.lng, entity.lat];
  yield drone.save();

  return drone.toObject();
}

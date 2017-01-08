/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate drones in the system
 * This includes create, update and get a list of all the drones
 *
 * @author      TCSCODER
 * @version     1.0
 */

const DroneService = require('../services/DroneService');
const helper = require('../common/helper');

// Exports
module.exports = {
  getAll,
  getAllByProvider,
  create,
  update,
  deleteSingle,
  getSingle,
  currentLocations,
  updateLocation,
  createEmpty,
};


/**
 * Create a drone in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.json(yield DroneService.create(req.auth.payload.providerId, req.body));
}

/**
 * Get all the drones
 *
 * @param req the request
 * @param res the response
 */
function* getAll(req, res) {
  yield helper.splitQueryToArray(req.query, 'statuses');
  res.json(yield DroneService.getAll(req.query));
}

/**
 * get all drone by provider id
 * @param req
 * @param res
 */
function* getAllByProvider(req, res) {
  yield helper.splitQueryToArray(req.query, 'statuses');
  res.json(yield DroneService.getAllByProvider(req.auth.payload.providerId, req.query));
}
/**
 * Update a drone
 *
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  res.json(yield DroneService.update(req.auth.payload.providerId, req.params.id, req.body));
}

/**
 * delete drone by id
 */
function* deleteSingle(req, res) {
  res.json(yield DroneService.deleteSingle(req.auth.payload.providerId, req.params.id), 204);
}

/**
 * get single drone by id
 * @param req
 * @param res
 */
function * getSingle(req, res) {
  res.json(yield DroneService.getSingle(req.params.id));
}

/**
 * get drones current Location
 * @param req
 * @param res
 */
function* currentLocations(req, res) {
  res.json(yield DroneService.currentLocations(req.auth.payload.providerId));
}


/**
 * update a drone location
 */
function* updateLocation(req, res) {
  const nfzFields = helper.convertQueryFieldStringToArray(req.query.nfzFields);
  const nearDroneFields = helper.convertQueryFieldStringToArray(req.query.nearDroneFields);
  const returnNFZ = req.query.returnNFZ;
  const nfzLimit = req.query.nfzLimit;
  const nearDronesMaxDist = req.query.nearDronesMaxDist;
  const nearDronesLimit = req.query.nearDronesLimit;
  const drone = yield DroneService.updateLocation(req.params.id, req.body, returnNFZ,
    nfzFields, nfzLimit, nearDronesMaxDist, nearDroneFields, nearDronesLimit);
  res.json(drone);
  res.io.emit('dronepositionupdate', drone);
}

/**
 * obsolete , post drone
 */
function* createEmpty(req, res) {
  res.json({});
}


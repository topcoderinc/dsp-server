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

// Exports
module.exports = {
  getAll,
  create,
  update,
};

/**
 * Create a drone in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.json(yield DroneService.create(req.body));
}

/**
 * Get all the drones
 *
 * @param req the request
 * @param res the response
 */
function* getAll(req, res) {
  res.json(yield DroneService.getAll());
}

/**
 * Update a drone
 *
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  const drone = yield DroneService.update(req.params.id, req.body);
  res.json();
  res.io.emit('dronepositionupdate', drone);
}

/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate DronePosition in the system
 * This includes get a list of positions of drone
 *
 * @author      TCSCODER
 * @version     1.0
 */

const DronePositionService = require('../services/DronePositionService');

// Exports
module.exports = {
  getPositions,
};

/**
 * Get all positions of a drone
 *
 * @param req the request
 * @param res the response
 */
function* getPositions(req, res) {
  res.json(yield DronePositionService.getPositions(req.params.id, req.query));
}

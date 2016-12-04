/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate mission in the system
 * This includes search and get a single mission
 *
 * @author      TCSCODER
 * @version     1.0
 */

const MissionService = require('../services/MissionService');

// Exports
module.exports = {
  search,
  getSingle,
  monthlyCountByDrone,
  getAllByDrone,
};

/**
 * Search missions in the system
 *
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.json(yield MissionService.search(req.query));
}


/**
 * Get a single mission
 *
 * @param req the request
 * @param res the response
 */
function* getSingle(req, res) {
  res.json(yield MissionService.getSingle(req.params.id, req.auth.sub));
}


function* monthlyCountByDrone(req, res) {
  res.json(yield MissionService.monthlyCountByDrone(req.params.droneId, req.query));
}

function* getAllByDrone(req, res) {
  res.json(yield MissionService.getAllByDrone(req.params.droneId, req.query));
}

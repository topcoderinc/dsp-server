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
  create,
  update,
  search,
  getSingle,
  monthlyCountByDrone,
  getAllByDrone,
  download,
  remove,
};

/**
 * Create mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.json(yield MissionService.create(req.body));
}

/**
 * Update mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  res.json(yield MissionService.update(req.params.id, req.body));
}

/**
 * Delete mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* remove(req, res) {
  res.json(yield MissionService.remove(req.params.id));
}

/**
 * Download mission data
 *
 * @param req the request
 * @param res the response
 */
function* download(req, res) {
  const data = yield MissionService.download(req.params.id);
  const json = JSON.stringify(data.missionFile);
  res.setHeader('Content-disposition', `attachment; filename=${data.name}.mission`);
  res.setHeader('Content-type', 'application/json');
  res.send(json);
}

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
  res.json(yield MissionService.getSingle(req.params.id));
}


function* monthlyCountByDrone(req, res) {
  res.json(yield MissionService.monthlyCountByDrone(req.params.droneId, req.query));
}

function* getAllByDrone(req, res) {
  res.json(yield MissionService.getAllByDrone(req.params.droneId, req.query));
}

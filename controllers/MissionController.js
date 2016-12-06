/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate missions in the system
 * This includes create, update, delete, download and get a single mission
 * as well as get a list of all missions
 *
 * @author      TCSCODER
 * @version     1.0
 */

const MissionService = require('../services/MissionService');

// Exports
module.exports = {
  getAll,
  create,
  update,
  search,
  getSingle,
  deleteMission,
  download,
};

/**
 * Create a mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.json(yield MissionService.create(req.auth, req.body));
}

/**
 * Get all the missions
 *
 * @param req the request
 * @param res the response
 */
function* getAll(req, res) {
  res.json(yield MissionService.getAll(req.auth));
}

/**
 * Update a mission
 *
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  const mission = yield MissionService.update(req.params.id, req.body);
  res.json(mission);
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

/**
 * Delete a mission
 *
 * @param req the request
 * @param res the response
 */
function* deleteMission(req, res) {
  yield MissionService.deleteMission(req.params.id);
  res.json();
}

/**
 * Update a mission
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

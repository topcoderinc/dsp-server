/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate no fly zone in the system
 *
 * @author      TCSCODER
 * @version     1.0
 */

const NoFlyZoneService = require('../services/NoFlyZoneService');

// Exports
module.exports = {
  search,
  create,
  update,
  remove,
};

/**
 * Create nfz
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.json(yield NoFlyZoneService.create(req.body));
}

/**
 * Update nfz
 *
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  res.json(yield NoFlyZoneService.update(req.params.id, req.body));
}

/**
 * Remove nfz
 *
 * @param req the request
 * @param res the response
 */
function* remove(req, res) {
  yield NoFlyZoneService.remove(req.params.id);
  res.status(204).end();
}

/**
 * Search intersections
 * note: this is a POST request because it's more readable to provide geometry data in the request body.
 *
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.json(yield NoFlyZoneService.search(req.body));
}

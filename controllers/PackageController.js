/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate package in the system
 * This includes search and get a single mission
 *
 * @author      TCSCODER
 * @version     1.0
 */

const PackageService = require('../services/PackageService');

// Exports
module.exports = {
  search,
  getSingle,
  getRelated,
};

/**
 * Create a mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.json(yield PackageService.search(req.query));
}


/**
 * Get a single package
 *
 * @param req the request
 * @param res the response
 */
function* getSingle(req, res) {
  res.json(yield PackageService.getSingle(req.params.id));
}

/**
 * Get related packages
 *
 * @param req the request
 * @param res the response
 */
function* getRelated(req, res) {
  res.json(yield PackageService.getRelated(req.params.id));
}

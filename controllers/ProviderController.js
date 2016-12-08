/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate provider in the system
 * This includes search, update, delete, download and get a single mission
 * as well as get a list of all missions
 *
 * @author      TCSCODER
 * @version     1.0
 */

const ProviderService = require('../services/ProviderService');

// Exports
module.exports = {
  search,
  getSingle,
  getPackages,
  getMissions,
  getReviews,
  dashboard,
};

/**
 * Create a mission in the system
 *
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.json(yield ProviderService.search(req.query));
}


/**
 * Get a single provider
 *
 * @param req the request
 * @param res the response
 */
function* getSingle(req, res) {
  res.json(yield ProviderService.getSingle(req.params.id));
}

/**
 * Get packages of provider
 *
 * @param req the request
 * @param res the response
 */
function* getPackages(req, res) {
  res.json(yield ProviderService.getPackages(req.params.id));
}

/**
 * Get missions of provider
 *
 * @param req the request
 * @param res the response
 */
function* getMissions(req, res) {
  res.json(yield ProviderService.getMissions(req.params.id, req.query));
}

/**
 * Get reviews of provider
 *
 * @param req the request
 * @param res the response
 */
function* getReviews(req, res) {
  res.json(yield ProviderService.getReviews(req.params.id, req.query));
}

/**
 * get Dashboard of provider
 * @param req
 * @param res
 */
function* dashboard(req, res) {
  res.json(yield ProviderService.dashboard(req.auth.payload.providerId));
}

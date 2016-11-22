/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate packageRequest in the system
 * This includes create a packageRequest
 *
 * @author      TCSCODER
 * @version     1.0
 */

const _ = require('lodash');
const PackageRequestService = require('../services/PackageRequestService');

// Exports
module.exports = {
  create,
  get,
};

/**
 * Create a packageRequest in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  const entity = _.extend(req.body, { user: req.auth.sub, package: req.params.id });
  res.status(201).json(yield PackageRequestService.create(entity));
}

/**
 * get all packageRequests of current user in the system
 *
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.json(yield PackageRequestService.get(req.auth.sub, req.query));
}

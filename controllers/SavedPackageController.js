/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate savedPackage in the system
 * This includes create, remove a savedPackage
 * and get all savedPackages for current user
 *
 * @author      TCSCODER
 * @version     1.0
 */

const SavedPackageService = require('../services/SavedPackageService');

// Exports
module.exports = {
  create,
  get,
  remove,
};

/**
 * Create a savedPackage in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  res.status(201).json(yield SavedPackageService.create(req.auth.sub, req.params.id));
}

/**
 * Get all savedPackages of current user in the system
 *
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.json(yield SavedPackageService.get(req.auth.sub));
}

/**
 * Remove a savedPackage in the system
 *
 * @param req the request
 * @param res the response
 */
function* remove(req, res) {
  yield SavedPackageService.remove(req.auth.sub, req.params.id);
  res.status(204).end();
}

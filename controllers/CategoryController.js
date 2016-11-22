/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate category in the system
 * This includes get a list of all categories
 *
 * @author      TCSCODER
 * @version     1.0
 */

const CategoryService = require('../services/CategoryService');

// Exports
module.exports = {
  getAll,
};

/**
 * Get all categories in the system
 *
 * @param req the request
 * @param res the response
 */
function* getAll(req, res) {
  res.json(yield CategoryService.getAll(req.query));
}

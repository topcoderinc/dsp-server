/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate review in the system
 * This includes create a review
 *
 * @author      TCSCODER
 * @version     1.0
 */

const _ = require('lodash');
const ReviewService = require('../services/ReviewService');

// Exports
module.exports = {
  create,
};

/**
 * Create a review in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  const entity = _.extend(req.body, { user: req.auth.sub, mission: req.params.id });
  res.status(201).json(yield ReviewService.create(entity));
}

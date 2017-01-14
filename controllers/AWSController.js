/**
 * Copyright (c) 2017 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's for AWS.
 *
 * @author      TCSCODER
 * @version     1.0
 */

const AWSService = require('../services/AWSService');

// Exports
module.exports = {
  getFederationToken,
};


/**
 * Generate federation token
 *
 * @param req the request
 * @param res the response
 */
function* getFederationToken(req, res) {
  res.json(yield AWSService.getFederationToken(req.auth.sub, req.body));
}

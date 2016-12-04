/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Application authentication middleware
 *
 * @author      TCSCODER
 * @version     1.0
 */

const jwt = require('express-jwt');
const config = require('config');

const jwtCheck = jwt({
  secret: new Buffer(config.JWT_SECRET, 'base64'),
  audience: config.AUTH0_CLIENT_ID,
  requestProperty: 'auth',
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    return req.query.token;
  },
});

/**
 * Export a function
 * @return {Function}       return the middleware function
 */
module.exports = () => jwtCheck;

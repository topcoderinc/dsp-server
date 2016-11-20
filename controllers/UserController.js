/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate users in the system
 * This includes auth, social auth and register
 *
 * @author      TCSCODER
 * @version     1.0
 */

const UserService = require('../services/UserService');

// Exports
module.exports = {
  login,
  register,
  registerSocialUser,
};

/**
 * Login a user in the system
 *
 * @param req the request
 * @param res the response
 */
function* login(req, res) {
  res.json(yield UserService.login(req.body));
}

/**
 * Register a user in the system
 *
 * @param req the request
 * @param res the response
 */
function* register(req, res) {
  res.json(yield UserService.register(req.body));
}

/**
 * Register a user via social login in the system
 *
 * @param req the request
 * @param res the response
 */
function* registerSocialUser(req, res) {
  res.json(yield UserService.registerSocialUser(req.body));
}

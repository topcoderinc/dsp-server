/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';

/**
 * Common error handling middleware
 *
 * @author      TSCCODER
 * @version     1.0
 */

const Role = require('../enum').Role;
const errors = require('common-errors');
const User = require('../models').User;

/**
 * check the user permission
 * if user role not provider , then cannot ask provider resource
 * @param req
 * @param res
 * @param next
 */
function providerRoleCheck(req, res, next) {
  User.findOne({_id: req.auth.sub}, (err, user) => {
    if (!user) {
      throw new errors.AuthenticationRequiredError('Anonymous is not allowed to access', 401);
    }

    if (user.role !== Role.PROVIDER || !user.provider) {
      throw new errors.NotPermittedError('Non-provider is not allowed to access', 403);
    }
    req.auth.payload = {
      role: Role.PROVIDER,
      providerId: user.provider.toString(),
    };
    next();
  });
}


module.exports = {
  providerRole() {
    return providerRoleCheck;
  },
};

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
      next(new errors.AuthenticationRequiredError('Anonymous is not allowed to access', 401));
      return;
    }

    if (user.role !== Role.PROVIDER || !user.provider) {
      next(new errors.NotPermittedError('Non-provider is not allowed to access', 403));
      return;
    }
    req.auth.payload = {
      role: Role.PROVIDER,
      providerId: user.provider.toString(),
    };
    next();
  });
}

/**
 * check the user permission
 * if user role not pilot or provider, then cannot ask provider resource
 * @param req
 * @param res
 * @param next
 */
function pilotProviderRoleCheck(req, res, next) {
  User.findOne({_id: req.auth.sub}, (err, user) => {
    if (!user) {
      next(new errors.AuthenticationRequiredError('Anonymous is not allowed to access', 401));
      return;
    }

    if ((user.role !== Role.PROVIDER || !user.provider) && (user.role !== Role.PILOT)) {
      next(new errors.NotPermittedError('User who is not either provider or pilot is not allowed to access', 403));
      return;
    }

    req.auth.payload = {
      role: user.role
    };
    if (user.role === Role.PROVIDER) {
      req.auth.payload.providerId = user.provider.toString();
    }
    next();
  });
}


module.exports = {
  providerRole() {
    return providerRoleCheck;
  },
  pilotProviderRole() {
    return pilotProviderRoleCheck;
  },
};

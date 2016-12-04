/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * User module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');

const models = require('../models');

const User = models.User;
const helper = require('../common/helper');
const errors = require('common-errors');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('config');
const MailService = require('./MailService');
const logger = require('../common/logger');
const Role = require('../enum').Role;
const ProviderService = require('./ProviderService');
const _ = require('lodash');

// Exports
module.exports = {
  login,
  register,
  registerSocialUser,
  forgotPassword,
  resetPassword,
};

/**
 * Validate that the email is unique in the system
 *
 * @param {Object}  entity        the username/email entity to check for uniqueness
 */
function* validateUniqueUser(entity) {
  const existingUser = yield User.findOne({email: entity.email});
  if (existingUser) {
    throw new errors.ValidationError('email already exists in the system', httpStatus.BAD_REQUEST);
  }
}

// the joi schema for register
register.schema = {
  entity: joi.object().keys({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
    role: joi.string().valid(_.values(Role)),
  }).required(),
};

// the joi schema for register user via social login
registerSocialUser.schema = {
  entity: joi.object().keys({
    name: joi.string().required(),
    email: joi.string().email().required(),
    role: joi.string().valid(_.values(Role)),
  }).required(),
};

/**
 * Register a user
 *
 * @param {Object}  entity        the post entity from the client
 */
function* register(entity) {
  // make sure the email is unique
  yield validateUniqueUser(entity);
  // hash password, persist user and generate new jwt token for user
  entity.password = yield helper.hashString(entity.password, config.SALT_WORK_FACTOR);
  entity.name = `${entity.firstName} ${entity.lastName}`;

  entity.role = entity.role || Role.CONSUMER;
  const user = yield User.create(entity);

  const userObj = user.toObject();
  const token = yield generateToken(userObj);

  return {
    accessToken: token,
    user: userObj,
  };
}

/**
 * Register a user via social login
 *
 * @param {Object}  entity        the post entity from the client
 */
function* registerSocialUser(entity) {
  // make sure the email is unique
  const existingUser = yield User.findOne({email: entity.email});

  let user;
  if (existingUser) {
    user = existingUser;
  } else {
    entity.role = entity.role || Role.CONSUMER;
    user = yield User.create(entity);
  }

  const userObj = user.toObject();
  const token = yield generateToken(userObj);

  return {
    accessToken: token,
    user: userObj,
  };
}

// the joi schema for login
login.schema = {
  entity: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }).required(),
};

/**
 * Generate a jwt token for specified user
 * @param  {Object}     userObj     the user for which to generate the token
 */
function* generateToken(userObj) {
  const jwtBody = {
    sub: userObj.id,
  };
  return jwt.sign(jwtBody, new Buffer(config.JWT_SECRET, 'base64'), {
    expiresIn: config.TOKEN_EXPIRES,
    audience: config.AUTH0_CLIENT_ID,
  });
}

/**
 * Authenticate a user and returns a auth token
 *
 * @param {Object}  entity        the post entity from the client
 */
function* login(entity) {
  // validate that email and password is valid, generate token
  const user = yield User.findOne({email: entity.email});
  if (!user) {
    throw new errors.NotFoundError('user not found with the specified email');
  }
  const valid = yield helper.validateHash(user.password, entity.password);

  if (valid === false) {
    // password is not valid
    throw new errors.HttpStatusError(401, 'password is invalid');
  }

  const userObj = user.toObject();
  const token = yield generateToken(userObj);

  return {
    accessToken: token,
    user: userObj,
  };
}


// the joi schema for forgotPassword
forgotPassword.schema = {
  entity: joi.object().keys({
    email: joi.string().email().required(),
  }).required(),
};
/**
 * Send an resetPasswordCode to user's email if s/he's forgot password
 *
 * @param {Object}  entity        the post entity from the client
 */
function* forgotPassword(entity) {
  const code = Math.floor(Math.random() * 100000).toString(16);
  // print out code for debug purpose
  logger.debug(`reset password code is ${code}`);
  const text = 'You received this email because you send a reset password request to us, ' +
    'if you never registered, please ignore. ' +
    `The verify code is ${code}\n -- example.com`;
  const html = `<p>${text}</p>`;

  const user = yield User.findOne({email: entity.email});
  if (!user) {
    throw new errors.NotFoundError('user not found with the specified email');
  }

  user.resetPasswordCode = code;
  const date = new Date();
  user.resetPasswordExpiration = date.setSeconds(date.getSeconds() + config.RESET_CODE_EXPIRES);
  yield user.save();

  yield MailService.sendMessage(user.email, html, text);
}

// the joi schema for resetPassword
resetPassword.schema = {
  entity: joi.object().keys({
    email: joi.string().email().required(),
    code: joi.string().required(),
    password: joi.string().required(),
  }).required(),
};
/**
 * Reset user's password
 *
 * @param {Object}  entity        the post entity from the client
 */
function* resetPassword(entity) {
  const user = yield User.findOne({email: entity.email});
  if (!user) {
    throw new errors.NotFoundError('user not found with the specified email');
  }
  if (!user.resetPasswordCode ||
    user.resetPasswordCode !== entity.code ||
    user.resetPasswordExpiration.getTime() - new Date().getTime() < 0) {
    throw new errors.HttpStatusError(400, 'invalid code');
  }

  user.password = yield helper.hashString(entity.password, config.SALT_WORK_FACTOR);
  user.resetPasswordCode = null;
  user.resetPasswordExpiration = null;
  yield user.save();
}

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

// Exports
module.exports = {
  login,
  register,
};

/**
 * Validate that the email is unique in the system
 *
 * @param {Object}  entity        the username/email entity to check for uniqueness
 */
function* validateUniqueUser(entity) {
  const existingUser = yield User.findOne({ email: entity.email });
  if (existingUser) {
    throw new errors.ValidationError('email already exists in the system', httpStatus.BAD_REQUEST);
  }
}

// the joi schema for register
register.schema = {
  entity: joi.object().keys({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
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

  const user = yield User.create(entity);
  return user.toObject();
}

// the joi schema for login
login.schema = {
  entity: joi.object().keys({
    email: joi.string().required(),
    password: joi.string().required(),
  }).required(),
};

/**
 * Generate a jwt token for specified user
 * @param  {Object}     userObj     the user for which to generate the token
 */
function generateToken(userObj) {
  return jwt.sign({
    sub: userObj.id,
  }, new Buffer(config.JWT_SECRET, 'base64'), { expiresIn: config.TOKEN_EXPIRES,
    audience: config.AUTH0_CLIENT_ID });
}

/**
 * Authenticate a user and returns a auth token
 *
 * @param {Object}  entity        the post entity from the client
 */
function* login(entity) {
  // validate that email and password is valid, generate token
  const user = yield User.findOne({ email: entity.email });
  if (!user) {
    throw new errors.NotFoundError('user not found with the specified email');
  }
  const valid = yield helper.validateHash(user.password, entity.password);

  if (valid === false) {
    // password is not valid
    throw new errors.UnauthorizedError('password is invalid');
  }

  const userObj = user.toObject();
  const token = generateToken(userObj);

  return {
    accessToken: token,
    user: userObj,
  };
}

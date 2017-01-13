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
const Provider = models.Provider;
const helper = require('../common/helper');
const errors = require('common-errors');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('config');
const MailService = require('./MailService');
const logger = require('../common/logger');
const enums = require('../enum');
const _ = require('lodash');

const Role = enums.Role;

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
    provider: joi.object().keys({
      name: joi.string().required(),
      status: joi.string().valid(_.values(enums.ProviderStatus)).required(),
      location: joi.object().keys({
        coordinates: joi.array().items(joi.number()).length(2).required(),
        line1: joi.string().required(),
        line2: joi.string(),
        city: joi.string().required(),
        state: joi.string().required(),
        postalCode: joi.string().required(),
        primary: joi.boolean().required(),
      }).required(),
    }).when('role', {is: Role.PROVIDER, then: joi.required(), otherwise: joi.forbidden()}),
  }).required(),
};

// the joi schema for register user via social login
registerSocialUser.schema = {
  auth: joi.object().required(),
  entity: joi.object().keys({
    name: joi.string().required(),
    email: joi.string().email().required(),
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

  if (entity.role === Role.PROVIDER) {
    // set initial field
    _.extend(entity.provider, {
      keywords: [''], // will be update when package created or updated
      simpleKeywords: [''], // will be update when package created or updated
      rating: {// will be update when review of related mission created
        count: 0,
        sum: 0,
        avg: 0,
      },
    });
    const provider = yield Provider.create(entity.provider);
    entity.provider = provider.id;
  }

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
 * @param {Object}  auth          the currently logged in user context
 * @param {Object}  entity        the post entity from the client
 */
function* registerSocialUser(auth, entity) {
  // make sure the email is unique
  // we don't need to check here for social network type, as social network id itself
  // embed the social network type
  const existingUser = yield User.findOne({ $or: [{email: entity.email}, {socialNetworkId: auth.sub}] });
  let user;
  if (existingUser) {
    // update social network type
    existingUser.socialNetworkType = auth.sub.substring(0, auth.sub.indexOf('|'));
    user = yield existingUser.save();
  } else {
    entity.socialNetworkId = auth.sub;
    entity.socialNetworkType = auth.sub.substring(0, auth.sub.indexOf('|'));
    entity.role = Role.CONSUMER;
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
  const user = yield User.findOne({email: entity.email}).populate('provider').exec();
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
  const subject = config.RESET_PASSWORD_SUBJECT;
  const link = config.RESET_PASSWORD_LINK.replace(':token', code);
  const text = config.RESET_PASSWORD_TEMPLATE.replace(':link', link);
  const html = `<p>${text}</p>`;

  const user = yield User.findOne({email: entity.email});
  if (!user) {
    throw new errors.NotFoundError('user not found with the specified email');
  }
  // check if the user is social network user, and if yes than don't allow forgot password
  if (user.socialNetworkId) {
    throw new errors.ValidationError('social network user cannot reset password', httpStatus.BAD_REQUEST);
  }

  user.resetPasswordCode = code;
  const date = new Date();
  user.resetPasswordExpiration = date.setSeconds(date.getSeconds() + config.RESET_CODE_EXPIRES);
  yield user.save();

  yield MailService.sendMessage(user.email, html, text, subject);
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
  // check if the user is social network user, and if yes than don't allow forgot password
  if (user.socialNetworkId) {
    throw new errors.ValidationError('social network user cannot reset password', httpStatus.BAD_REQUEST);
  }

  user.password = yield helper.hashString(entity.password, config.SALT_WORK_FACTOR);
  user.resetPasswordCode = null;
  user.resetPasswordExpiration = null;
  yield user.save();
}

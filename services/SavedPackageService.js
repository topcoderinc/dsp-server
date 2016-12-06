/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * SavedPackage module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');
const httpStatus = require('http-status');

const Package = require('../models').Package;
const SavedPackage = require('../models').SavedPackage;
const errors = require('common-errors');

// Exports
module.exports = {
  get,
  create,
  remove,
};

/**
 * Validate that the savedPackage is unique in the system
 *
 * @param {String}  userId        the user id
 * @param {String}  packageId     the package id
 */
function* isExsits(userId, packageId) {
  const doc = yield SavedPackage.findOne({user: userId, package: packageId});
  return !!doc;
}

// the joi schema for create
create.schema = {
  userId: joi.string().required(),
  packageId: joi.string().required(),
};
/**
 * Create a SavedPackage in the system.
 *
 * @param {String}    userId          the user id
 * @param {String}    packageId       the package id
 *
 */
function* create(userId, packageId) {
  const pack = yield Package.findOne({_id: packageId});
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${packageId}`);
  }
  const exists = yield isExsits(userId, packageId);
  if (exists) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'package already saved');
  }
  yield SavedPackage.create({user: userId, package: packageId, provider: pack.provider});
}

// the joi schema for get
get.schema = {
  id: joi.string().required(),
};

/**
 * get all request for current user
 *
 * @param {String}    id          the user id
 * @param {Object}    query       the query in url
 */
function* get(id) {
  const docs = yield SavedPackage.find({user: id}).populate('package').populate('provider');
  return _.map(docs, (d) => {
    const sanitized = _.pick(d, 'id', 'package');
    sanitized.package = _.pick(d.package, 'id', 'name', 'imageUrl', 'thumbnailUrl',
      'price', 'bestseller', 'promoted', 'discount');
    sanitized.package.provider = _.pick(d.provider, 'id', 'name');
    return sanitized;
  });
}

// the joi schema for remove
remove.schema = {
  userId: joi.string().required(),
  packageId: joi.string().required(),
};

function* remove(userId, packageId) {
  const pack = yield Package.findOne({_id: packageId});
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${packageId}`);
  }
  const exists = yield isExsits(userId, packageId);
  if (!exists) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'package is not saved');
  }
  yield SavedPackage.remove({user: userId, package: packageId});
}

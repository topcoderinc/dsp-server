/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * PackageRequest module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');

const Package = require('../models').Package;
const PackageRequest = require('../models').PackageRequest;
const errors = require('common-errors');
const enums = require('../enum');

// Exports
module.exports = {
  get,
  create,
};

// the joi schema for search
create.schema = {
  entity: joi.object().keys({
    user: joi.string().required(),
    package: joi.string().required(),
    recipientName: joi.string().required(),
    phoneNumber: joi.string().required(),
    destinationPoint: joi.object().keys({
      coordinates: joi.array().items(joi.number()).length(2).required(),
      line1: joi.string().required(),
      line2: joi.string(),
      city: joi.string().required(),
      postalCode: joi.string().required(),
    }),
    launchDate: joi.date(),
    additionalInfo: joi.string(),
  }).required(),
};

/**
 * Search packages in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* create(entity) {
  const pack = yield Package.findOne({ _id: entity.package });
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${entity.package}`);
  }
  entity.provider = pack.provider;
  entity.status = enums.RequestStatus.IN_PROGRESS;
  entity.contactInfo = {
    recipientName: entity.recipientName,
    phoneNumber: entity.phoneNumber,
  };
  const created = yield PackageRequest.create(entity);
  return created.toObject();
}

get.schema = {
  id: joi.string().required(),
  query: joi.object().keys({
    limit: joi.number().integer().min(1).required(),
    offset: joi.number().integer().min(0),
    status: joi.string().valid(_.values(enums.RequestStatus)),
  }),
};

/**
 * get all request for current user
 *
 * @param {String}    id          the user id
 * @param {Object}    query       the query in url
 */
function* get(id, query) {
  const criteria = { user: id };
  if (query.status) {
    criteria.status = query.status;
  }
  const total = yield PackageRequest.find(criteria).count();
  const docs = yield PackageRequest.find(criteria).skip(query.offset || 0).limit(query.limit)
        .populate('mission').populate('provider').populate('package');
  return {
    total,
    items: _.map(docs, (d) => {
      const sanitized = _.pick(d, 'id', 'status', 'launchDate');
      if (d.mission) {
        sanitized.mission = {
          id: d.mission.id,
        };
      }

      sanitized.package = _.pick(d.package, 'id', 'name');
      sanitized.provider = _.pick(d.provider, 'id', 'name');

      return sanitized;
    }),
  };
}

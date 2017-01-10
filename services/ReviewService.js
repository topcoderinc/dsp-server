/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Review module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');

const Mission = require('../models').Mission;
const Review = require('../models').Review;
const errors = require('common-errors');

// Exports
module.exports = {
  create,
};

// the joi schema for search
create.schema = {
  entity: joi.object().keys({
    publicFeedback: joi.string(),
    privateFeedback: joi.string(),
    rating: joi.number().required(),
    user: joi.string().required(),
    mission: joi.string().required(),
  }).required(),
};

/**
 * Search packages in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* create(entity) {
  const mission = yield Mission.findOne({ _id: entity.mission });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${entity.mission}`);
  }
  entity.provider = mission.provider;
  const created = yield Review.create(entity);
  return _.omit(created.toObject(), 'user');
}

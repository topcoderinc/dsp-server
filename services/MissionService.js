/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Mission module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');

const Mission = require('../models').Mission;
const errors = require('common-errors');

// Exports
module.exports = {
  search,
  getSingle,
};

// the joi schema for search
search.schema = {
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer().required(),
  }).required(),
};

/**
 * Search missions in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* search(entity) {
  const total = yield Mission.find().count();
  const docs = yield Mission.find().skip(entity.offset || 0).limit(entity.limit).populate('package');
  return {
    total,
    items: _.map(docs, (d) => ({ id: d.id, package: d.package.toObject() })),
  };
}


// the joi schema for getSingle
getSingle.schema = {
  id: joi.string().required(),
  userId: joi.string().required(),
};

/**
 * Get a mission identified by id
 */
function* getSingle(id, userId) {
  const mission = yield Mission.findOne({ _id: id });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  if (mission.pilot.toString() !== userId) {
    throw new errors.HttpStatusError(403, 'no permission');
  }
  return mission.toObject();
}

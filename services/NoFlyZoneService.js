/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * NoFlyZone module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');
const errors = require('common-errors');
const MissionService = require('./MissionService');
const NoFlyZone = require('../models').NoFlyZone;

// Exports
module.exports = {
  search,
  create,
  update,
  remove,
};

/**
 * Throw error if NoFlyZone entity is null
 * @param {String} id
 * @param {Object} entity
 * @private
 */
function _assertExists(id, entity) {
  if (!entity) {
    throw new errors.NotFoundError(`no fly zone not found with specified id ${id}`);
  }
}

/**
 * Validate mission values
 * @param values
 * @private
 */
function* _validateMission(values) {
  if (values.mission) {
    yield MissionService.getSingle(values.mission);
  }
  if (values.isPermanent) {
    values.startTime = null;
    values.endTime = null;
  } else if (values.startTime.getTime() > values.endTime.getTime()) {
    throw new errors.ArgumentError('startDate cannot be greater than endDate');
  }
}

/**
 * Search No fly zones
 * @param {Object} criteria
 * @param {String} criteria.mission matches the missions id
 * @param {Boolean} criteria.isActive matches the isActive flag
 * @param {Boolean} criteria.isPermanent matches the isPermanent flag
 * @param {Boolean} criteria.matchTime the flag if must match startTime or endTime
 * @param {Object} criteria.geometry the geometry to intersect
 * @param {String} criteria.geometry.type the geometry type Point or Polygon
 * @param {Array} criteria.geometry.coordinates the coordinates
 * Sample Point coordinates:
 * [0, 1]
 *
 * Sample Polygon coordinates (single ring)
 * [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
 * @param {Number} criteria.limit the limit
 * @param {Number} criteria.offset the offset
 *
 * @param {Array} criteria.projFields an array of field names needs to be projected and returned.
 */
function* search(criteria) {
  let filter = _.pick(criteria, 'mission', 'isActive', 'isPermanent');
  if (criteria.geometry) {
    filter.location = {
      $geoIntersects: {
        $geometry: criteria.geometry,
      },
    };
  }
  if (criteria.matchTime) {
    filter = {
      $and: [
        filter,
        {
          $or: [
            {
              isPermanent: false,
              startTime: {$lte: new Date()},
              endTime: {$gte: new Date()},
              drone: {$ne: criteria.droneId},
            },
            {
              isPermanent: true,
            },
          ],
        },
      ],
    };
  }
  let projection = '';
  if (criteria.projFields && criteria.projFields.length > 0) {
    projection = criteria.projFields.join(' ');
  }
  return yield {
    total: NoFlyZone.count(filter),
    items: NoFlyZone
      .find(filter, projection)
      .skip(criteria.offset)
      .sort('-id')
      .limit(criteria.limit),
  };
}

search.schema = {
  criteria: {
    mission: joi.objectId(),
    droneId: joi.objectId(),
    isActive: joi.bool(),
    isPermanent: joi.bool(),
    geometry: joi.geoJSON(),
    matchTime: joi.bool(),
    offset: joi.offset(),
    limit: joi.limit(),
    projFields: joi.array().items(joi.string()).default([]),
  },
};

/**
 * Create no fly zone
 * @param {NoFlyZone} values
 * @returns {NoFlyZone}
 */
function* create(values) {
  yield _validateMission(values);
  return yield NoFlyZone.create(values);
}

create.schema = {
  values: joi.object().keys({
    location: joi.geoJSON().required(),
    circle: {
      center: joi.array().items(joi.number()),
      radius: joi.number(),
    },
    description: joi.string().required(),
    startTime: joi.date().iso().allow(null),
    endTime: joi.date().iso().allow(null),
    style: joi.object(),
    isActive: joi.bool().required(),
    isPermanent: joi.bool().required(),
    mission: joi.objectId(),
    drone: joi.objectId()
  }).and('startTime', 'endTime'),
};

/**
 * Update no fly zone
 * @param {String} id the id to update
 * @param {NoFlyZone} values
 * @returns {NoFlyZone}
 */
function* update(id, values) {
  yield _validateMission(values);
  const ret = yield NoFlyZone.findByIdAndUpdate(id, values, {new: true});
  _assertExists(id, ret);
  return ret;
}
update.schema = {
  id: joi.objectId().required(),
  values: {
    id: joi.any().strip(),
    location: joi.geoJSON().required(),
    circle: joi.object({
      center: joi.array().items(joi.number()),
      radius: joi.number(),
    }).allow(null),
    description: joi.string().required(),
    startTime: joi.date().iso(),
    endTime: joi.date().iso(),
    style: joi.object(),
    isActive: joi.bool().required(),
    isPermanent: joi.bool().required(),
    mission: joi.objectId(),
  },
};


/**
 * Remove no fly zone
 * @param {String} id the id to remove
 */
function* remove(id) {
  const ret = yield NoFlyZone.findByIdAndRemove(id);
  _assertExists(id, ret);
}

remove.schema = {
  id: joi.objectId().required(),
};

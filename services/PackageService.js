/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Package module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const Package = require('../models').Package;
const helper = require('../common/helper');
const errors = require('common-errors');

// Exports
module.exports = {
  search,
  getSingle,
  getRelated,
  create,
};

// the joi schema for search
search.schema = {
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer().required(),
    longitude: joi.number().required(),
    latitude: joi.number().required(),
    maxDistance: joi.number().required(),
    type: joi.string().valid('popular', 'promoted').required(),
  }).required(),
};

/**
 * create a package with provider and service
 */

function * create(provider, service, packageEntity) {
  packageEntity.provider = provider;
  packageEntity.location = provider.location;
  packageEntity.service = service.id;
  packageEntity.longDescription = packageEntity.description;
  packageEntity.shortDescription = packageEntity.description;
  packageEntity.rating = {count: 0, sum: 0, avg: 0};
  return yield Package.create(packageEntity);
}

/**
 * Search packages in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* search(entity) {
  const criteria = {
    'location.coordinates': {
      $near: {
        $geometry: {type: 'Point', coordinates: [entity.longitude, entity.latitude]},
        $maxDistance: entity.maxDistance,
      },
    },
  };

  if (entity.type === 'popular') {
    criteria.bestseller = true;
  } else {
    criteria.promoted = true;
  }

  const total = yield Package.find(criteria).count();
  const docs = yield Package.find(criteria).skip(entity.offset || 0).limit(entity.limit);
  return {
    total,
    items: helper.sanitizeArray(docs),
  };
}


// the joi schema for getSingle
getSingle.schema = {
  id: joi.string().required(),
};

/**
 * Get a package identified by id
 */
function* getSingle(id) {
  const pack = yield Package.findOne({_id: id});
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${id}`);
  }
  return pack.toObject();
}

// the joi schema for getRelated
getRelated.schema = {
  id: joi.string().required(),
};

/**
 * Get related packages identified by id
 */
function* getRelated(id) {
  const pack = yield Package.findOne({_id: id});
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${id}`);
  }
  // assume that packages that shared with same provider are related
  const docs = yield Package.find({provider: pack.provider, _id: {$ne: id}});
  return helper.sanitizeArray(docs);
}

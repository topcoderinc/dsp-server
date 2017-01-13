/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Provider module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');

const Provider = require('../models').Provider;
const Package = require('../models').Package;
const Service = require('../models').Service;
const Mission = require('../models').Mission;
const Review = require('../models').Review;
const Drone = require('../models').Drone;
const PackageRequest = require('../models').PackageRequest;
const Const = require('../enum');
const helper = require('../common/helper');
const errors = require('common-errors');
const enums = require('../enum');

// Exports
module.exports = {
  search,
  getSingle,
  getSingleByUser,
  getPackages,
  getMissions,
  getReviews,
  dashboard,
};

// the joi schema for search
search.schema = {
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer().required(),
    sortBy: joi.string().valid('popularity', 'date', 'price', '-popularity', '-date', '-price'),
    longitude: joi.number().required(),
    latitude: joi.number().required(),
    minPrice: joi.number(),
    maxPrice: joi.number(),
    maxDistance: joi.number().required(),
    categoryId: joi.string(),
    keyword: joi.string(),
    simpleKeyword: joi.string(),
  }).required(),
};

/**
 * Search providers in the system.
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

  if (!_.isNil(entity.minPrice)) {
    criteria.maxPrice = {
      $gt: entity.minPrice,
    };
  }

  if (!_.isNil(entity.maxPrice)) {
    criteria.minPrice = {
      $lt: entity.maxPrice,
    };
  }

  if (!_.isNil(entity.categoryId)) {
    const services = yield Service.find({category: entity.categoryId});
    const providers = _.uniq(_.map(services, 'provider'));
    criteria._id = {
      $in: providers,
    };
  }

  if (!_.isNil(entity.keyword)) {
    criteria.keywords = entity.keyword;
  }

  if (!_.isNil(entity.simpleKeyword)) {
    criteria.simpleKeywords = entity.simpleKeyword;
  }

  const sortBy = {};

  if (entity.sortBy) {
    const direction = entity.sortBy[0] === '-' ? -1 : 1;
    const field = entity.sortBy[0] === '-' ? entity.sortBy.slice(1) : entity.sortBy;
    switch (field) {
      case 'popularity':
        sortBy['rating.count'] = direction;
        break;
      case 'date':
        sortBy.updatedAt = direction;
        break;
      case 'price':
        sortBy.minPrice = direction;
        break;
      default:
        break;
    }
  }

  const total = yield Provider.find(criteria).count();
  const docs = yield Provider.find(criteria).sort(sortBy).skip(entity.offset || 0).limit(entity.limit);
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
 * Get a provider identified by id
 */
function* getSingle(id) {
  const provider = yield Provider.findOne({_id: id});
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${id}`);
  }
  return provider.toObject();
}


// the joi schema for getPackages
getPackages.schema = {
  id: joi.string().required(),
};


/**
 * Get packages of provider
 *
 * @param req the request
 * @param res the response
 */
function* getPackages(id) {
  const provider = yield Provider.findOne({_id: id});
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${id}`);
  }
  const docs = yield Package.find({provider: id});
  return helper.sanitizeArray(docs);
}

// the joi schema for getMissions
getMissions.schema = {
  id: joi.string().required(),
  query: joi.object().keys({
    limit: joi.number().integer().min(1).required(),
    offset: joi.number().integer().min(0),
  }).required(),
};


/**
 * Get missions of provider
 *
 * @param req the request
 * @param res the response
 */
function* getMissions(id, query) {
  const provider = yield Provider.findOne({_id: id});
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${id}`);
  }

  const criteria = {provider: id, status: enums.MissionStatus.COMPLETED};
  const total = yield Mission.find(criteria).count();
  const docs = yield Mission.find(criteria).sort({updatedAt: -1})
    .skip(query.offset || 0).limit(query.limit).populate('package');
  return {
    total,
    items: _.map(docs, (d) => ({id: d.id, packageName: d.package.name, completedAt: d.completedAt})),
  };
}


// the joi schema for getReviews
getReviews.schema = {
  id: joi.string().required(),
  query: joi.object().keys({
    limit: joi.number().integer().min(1).required(),
    offset: joi.number().integer().min(0),
  }).required(),
};

/**
 * Get reviews of provider
 *
 * @param req the request
 * @param res the response
 */
function* getReviews(id, query) {
  const provider = yield Provider.findOne({_id: id});
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${id}`);
  }

  const criteria = {provider: id};
  const total = yield Review.find(criteria).count();
  const docs = yield Review.find(criteria).sort({createdAt: -1}).skip(query.offset || 0).limit(query.limit).populate('user');
  return {
    total,
    items: _.map(docs, (d) => {
      const sanitized = _.pick(d, 'id', 'rating', 'createdAt', 'publicFeedback');
      sanitized.user = _.pick(d.user.toObject(), 'id', 'lastName', 'firstName', 'avatarUrl');
      return sanitized;
    }),
  };
}


/**
 *  get provider by userid
 * @param id
 */
function* getSingleByUser(id) {
  const provider = yield Provider.findOne({user: id});
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified user id ${id}`);
  }
  return provider;
}

/**
 * get provider dashbord
 * @param providerId the provider id
 */
function* dashboard(providerId) {
  return {
    pendingRequestCount: yield PackageRequest.find({
      provider: providerId,
      status: Const.RequestStatus.PENDING,
    }).count(),
    scheduledMissionCount: yield Mission.find({provider: providerId, status: Const.MissionStatus.SCHEDULED}).count(),
    inProgressMissionCount: yield Mission.find({
      provider: providerId,
      status: Const.MissionStatus.IN_PROGRESS,
    }).count(),
    completedMissionCount: yield Mission.find({provider: providerId, status: Const.MissionStatus.COMPLETED}).count(),
    droneCount: yield Drone.find({provider: providerId}).count(),
  };
}

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


const Service = require('../models').Service;
const Package = require('../models').Package;
const Provider = require('../models').Provider;
const Category = require('../models').Category;
const PackageService = require('../services/PackageService');
const ProviderService = require('../services/ProviderService');
const errors = require('common-errors');
const helper = require('../common/helper');

const _ = require('lodash');

module.exports = {
  create,
  update,
  deleteSingle,
  getSingle,
  getAll,
};


const serviceCreateOrUpdateEnityJoi = joi.object().keys({
  id: joi.string(),
  name: joi.string().required(),
  pricing: joi.string().required(),
  description: joi.string().required(),
  category: joi.string(),
  packages: joi.array().items(joi.object().keys({
    id: joi.string(),
    name: joi.string().required(),
    description: joi.string().required(),
    deliverySpeed: joi.number(),
    costPerMile: joi.number(),
    insuranceClaim: joi.number(),
    maxWeight: joi.number(),
    price: joi.number().required(),
    discountPrice: joi.number(),
  }).min(1).required()),
}).required();

create.schema = {
  providerId: joi.string().required(),
  entity: serviceCreateOrUpdateEnityJoi,
};

function* validateCategoryId(id) {
  helper.validateObjectId(id);
  const doc = yield Category.findOne({_id: id});
  if (!doc) {
    throw new errors.NotFoundError(`category with id "${id}" not found`);
  }
}

/**
 * Create a new service with its packages for the current logged in user. Provider role only.
 * @param providerId
 * @param entity
 * @return {*}
 */
function* create(providerId, entity) {
  const provider = yield Provider.findOne({_id: providerId}).populate('location');
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${providerId}`);
  }
  if (entity.category) {
    yield validateCategoryId(entity.category);
  }
  entity.provider = providerId;
  const service = yield Service.create(entity);
  if (!_.isNil(entity.packages)) {
    for (let i = 0; i < entity.packages.length; i++) {
      yield PackageService.create(provider, service, entity.packages[i]);
    }
  }
  return yield getSingle(service.id);
}

update.schema = {
  providerId: joi.string().required(),
  id: joi.string().required(),
  entity: serviceCreateOrUpdateEnityJoi,
};
/**
 *Update the service and create/update/delete its packages for the current logged in user. Provider role only.
 * @param providerId
 * @param id the service id
 * @param entity
 */
function* update(providerId, id, entity) {
  const provider = yield Provider.findOne({_id: providerId}).populate('location');
  if (!provider) {
    throw new errors.NotFoundError(`provider not found with specified id ${providerId}`);
  }

  const service = yield Service.findOne({_id: id});
  if (!service) {
    throw new errors.NotFoundError(`Current logged in provider does not offer this service , id = ${id}`);
  }

  if (service.provider.toString() !== providerId) {
    throw new errors.NotPermittedError('Current logged in provider does not have permission');
  }

  if (entity.category) {
    yield validateCategoryId(entity.category);
  }

  _.extend(service, entity);
  yield service.save();
  yield Package.remove({service: service.id});
  for (let i = 0; i < entity.packages.length; i++) {
    yield PackageService.create(provider, service, entity.packages[i]);
  }
  return yield getSingle(service.id);
}


function* getSingle(id) {
  const service = yield Service.findOne({_id: id}).populate('category');
  if (!service) {
    throw new errors.NotFoundError(`Current logged in provider does not offer this service , id = ${id}`);
  }

  const ret = service.toObject();
  if (service.category) {
    ret.category = service.category.name;
  }
  const packages = yield Package.find({service: service.id});

  ret.packages = _.map(packages, (p) => {
    const sanz = _.pick(p, 'name', 'description', 'deliverySpeed', 'costPerMile'
      , 'insuranceClaim', 'maxWeight', 'price', 'discountPrice');
    sanz.id = p._id;
    return sanz;
  });
  return ret;
}


getAll.schema = {
  providerId: joi.string().required(),
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer().required(),
    sortBy: joi.string().valid(['name', 'pricing', '-name', '-pricing']),
  }).required(),
};
/**
 * get all service by provider id
 * @param entity
 */
function* getAll(providerId, entity) {
  const sortBy = {};
  if (!_.isNil(entity.sortBy)) {
    const name = entity.sortBy[0] === '-' ? entity.sortBy.substr(1) : entity.sortBy;
    const value = entity.sortBy[0] === '-' ? -1 : 1;
    sortBy[name] = value;
  }
  const querySet = {provider: providerId};
  const docs = yield Service.find(querySet).populate('category').sort(sortBy).skip(entity.offset || 0).limit(entity.limit);
  return {
    total: yield Service.find(querySet).count(),
    items: _.map(docs, (d) => {
      const sanz = _.pick(d, 'name', 'pricing', 'description');
      sanz.id = d._id;
      if (d.category) {
        sanz.category = d.category.name;
      }
      return sanz;
    }),
  };
}

function* deleteSingle(providerId, id) {
  const service = yield Service.findOne({_id: id});
  if (!service) {
    throw new errors.NotFoundError(`Current logged in provider does not offer this service , id = ${id}`);
  }
  if (service.provider.toString() !== providerId) {
    throw new errors.NotPermittedError('Current logged in provider does not have permission');
  }
  yield service.remove();
}

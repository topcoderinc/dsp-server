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
const User = require('../models').User;
const Mission = require('../models').Mission;
const Review = require('../models').Review;
const MissionStatus = require('../enum').MissionStatus;
const MissionService = require('../services/MissionService');

const Drone = require('../models').Drone;
const Service = require('../models').Service;
const PackageRequest = require('../models').PackageRequest;
const errors = require('common-errors');
const enums = require('../enum');
const helper = require('../common/helper');
const RequestStatus = require('../enum').RequestStatus;
const NotificationService = require('../services/NotificationService');
const NotificationType = require('../enum').NotificationType;
// Exports
module.exports = {
  get,
  getSingle,
  create,
  search,
  accept,
  reject,
  cancel,
  getSingleByProvider,
  assignDrone,
  complete,
  missionEstimation,
  missionTelemetry,
};

// the joi schema for search
create.schema = {
  entity: joi.alternatives().try(
    joi.object().keys({
      user: joi.string().required(),
      package: joi.string().required(),
      recipientName: joi.string().required(),
      phoneNumber: joi.string().required(),
      title: joi.string().required(),
      destinationPoint: joi.object().keys({
        coordinates: joi.array().items(joi.number()).length(2).required(),
        line1: joi.string().required(),
        line2: joi.string(),
        state: joi.string().required(),
        city: joi.string().required(),
        postalCode: joi.string().required(),
        primary: joi.boolean().required(),
      }).required(),
      startingPoint: joi.object().keys({
        coordinates: joi.array().items(joi.number()).length(2).required(),
        line1: joi.string().required(),
        line2: joi.string(),
        state: joi.string().required(),
        city: joi.string().required(),
        postalCode: joi.string().required(),
        primary: joi.boolean().required(),
      }).required(),
      launchDate: joi.date().required(),
      whatToBeDelivered: joi.string().required(),
    }),
    joi.object().keys({
      user: joi.string().required(),
      package: joi.string().required(),
      title: joi.string().required(),
      whatToBeDelivered: joi.string().required(),
      zones: joi.array().items(joi.object().keys({
        location: joi.object().keys({
          type: joi.string().required(),
          coordinates: joi.array().required(),
        }).required(),
        description: joi.string().required(),
        style: joi.object().required(),
      })).min(1).required(),
    })
  ),
};

/**
 * Search packages in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* create(entity) {
  const pack = yield Package.findOne({_id: entity.package});
  if (!pack) {
    throw new errors.NotFoundError(`package not found with specified id ${entity.package}`);
  }
  entity.provider = pack.provider;
  entity.status = enums.RequestStatus.PENDING;
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
    limit: joi.number().integer().required(),
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
  const criteria = {user: id};
  if (query.status) {
    criteria.status = query.status;
  }
  const total = yield PackageRequest.find(criteria).count();
  let docs;
  if (query.limit < 0) {
    docs = yield PackageRequest.find(criteria).populate('mission').populate('provider').populate('package');
  } else {
    docs = yield PackageRequest.find(criteria).skip(query.offset || 0).limit(query.limit)
      .populate('mission').populate('provider').populate('package');
  }

  return {
    total,
    items: _.map(docs, (d) => {
      const sanitized = _.pick(d, 'id', 'status', 'launchDate', 'title');
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


getSingle.schema = {
  userId: joi.string().required(),
  requestId: joi.string().required(),
};

/**
 * get a request by userId and requestId
 * @param userId
 * @param requestId
 * @return {*}
 * @private
 */
function * getSingle(userId, requestId) {
  helper.validateObjectId(requestId);
  const request = yield PackageRequest.findOne({user: userId, _id: requestId});
  if (!request) {
    throw new errors.NotFoundError('The request does not exist');
  }
  const doc = request.toObject();
  if (request.mission) {
    const mission = yield Mission.findOne({_id: request.mission}).populate('pilot').populate('provider');
    doc.mission = mission.toObject();
    if (mission.pilot) {
      doc.mission.pilot = mission.pilot.toObject();
    }
    if (mission.provider) {
      doc.mission.provider = mission.provider.toObject();
      const providerUser = yield User.findOne({provider: mission.provider.id});
      if (providerUser) {
        doc.mission.provider.phone = providerUser.phone;
      }
    }
    if (request.status === enums.RequestStatus.COMPLETED) {
      const review = yield Review.findOne({mission: mission.id});
      if (review) {
        doc.mission.review = review.toObject();
      }
    }
  }
  return doc;
}

search.schema = {
  providerId: joi.string().required(),
  entity: joi.object().keys({
    limit: joi.number().integer().required(),
    offset: joi.number().integer(),
    statuses: joi.array().items(joi.string().valid(_.values(enums.RequestStatus))),
    launchDate: joi.date(),
  }).required(),
};
/**
 * get all request by provider id and status,launchDate
 * @param provider_id the provider id
 * @param entity
 */
function* search(providerId, entity) {
  const criteria = {provider: providerId};
  if (!_.isNil(entity.statuses)) {
    criteria.status = {$in: entity.statuses};
  }
  if (!_.isNil(entity.launchDate)) {
    const date = new Date(entity.launchDate);
    criteria.launchDate = {$gte: date, $lte: date.getTime() + (24 * 60 * 60 * 1000)};
  }

  const total = yield PackageRequest.find(criteria).count();
  const docs = yield PackageRequest.find(criteria).sort({createdAt: -1}).skip(entity.offset || 0).limit(entity.limit)
    .populate('mission').populate('user').populate('package');

  const items = [];
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const sanitized = _.pick(d, 'id', 'status', 'launchDate', 'whatToBeDelivered', 'weight', 'payout', 'zones', 'title');
    const service = yield Service.findOne({_id: d.package.service}).populate('category');

    if (d.startingPoint) {
      sanitized.startingPoint = d.startingPoint.toObject();
    }
    if (d.destinationPoint) {
      sanitized.destinationPoint = d.destinationPoint.toObject();
    }
    if (d.startingPoint && d.destinationPoint) {
      sanitized.distance = helper.getFlatternDistance(sanitized.startingPoint.coordinates,
        sanitized.destinationPoint.coordinates);
    }
    sanitized.serviceName = service.name;
    if (service.category) {
      sanitized.serviceType = service.category.name;
    }
    sanitized.packageName = d.package.name;
    sanitized.customer = _.pick(d.user, 'firstName', 'lastName', 'phone', 'email');
    if (d.user.address) {
      sanitized.customer.address = d.user.address.toObject();
    }
    sanitized.customer.photoUrl = d.user.avatarUrl;

    items.push(sanitized);
  }
  return {
    total,
    items,
  };
}

/**
 * get a request by providerId and requestId , it's private function use for accept,complete,etc...
 * @param providerId
 * @param requestId
 * @return {*}
 * @private
 */
function * _getSingleByProvider(providerId, requestId) {
  const request = yield PackageRequest.findOne({provider: providerId, _id: requestId});
  if (!request) {
    throw new errors.NotFoundError('The provider does not have this request');
  }
  return request;
}

/**
 * accept a request by provider and request id , if status is not pending , it will raise an ArgumentError
 * @param providerId
 * @param requestId
 */
function* accept(providerId, requestId) {
  const request = yield _getSingleByProvider(providerId, requestId);


  if (request.status === RequestStatus.PENDING) {
    request.status = RequestStatus.SCHEDULED;
    yield request.save();
  } else {
    throw new errors.ArgumentError(`The provider status ${request.status} cannot be convert to accept`, 400);
  }
  yield NotificationService.create(request.user.toString(), NotificationType.REQUEST_ACCEPTED, {});
}

/**
 * reject a request by provider and request id , if status is not pending , it will raise an ArgumentError
 * @param providerId
 * @param requestId
 */
function* reject(providerId, requestId) {
  const request = yield _getSingleByProvider(providerId, requestId);
  if (request.status === RequestStatus.PENDING) {
    request.status = RequestStatus.REJECTED;
    yield request.save();
  } else {
    throw new errors.ArgumentError(`The provider status ${request.status} cannot be convert to reject`, 400);
  }
  yield NotificationService.create(request.user.toString(), NotificationType.REQUEST_REJECTED, {});
}


/**
 * Cancel a scheduled / in-progress request of the current logged in user,
 * then generate a notification to customer. Provider role only.
 * @param providerId
 * @param requestId
 */
function* cancel(providerId, requestId) {
  const request = yield _getSingleByProvider(providerId, requestId);
  if (request.status === RequestStatus.SCHEDULED || request.status === RequestStatus.IN_PROGRESS) {
    request.status = RequestStatus.CANCELLED;
    yield request.save();
  } else {
    throw new errors.ArgumentError(`The provider status ${request.status} cannot be convert to cancel`, 400);
  }
  yield NotificationService.create(request.user.toString(), NotificationType.REQUEST_CANCELLED, {});
}

/**
 * complete a request by provider and request id , if status is not in-progress , it will raise an ArgumentError
 * @param providerId
 * @param requestId
 */
function* complete(providerId, requestId) {
  const request = yield _getSingleByProvider(providerId, requestId);
  if (request.status === RequestStatus.IN_PROGRESS) {
    request.status = RequestStatus.COMPLETED;
    yield request.save();
  } else {
    throw new errors.ArgumentError(`The provider status ${request.status} cannot be convert to cancel`, 400);
  }
}


assignDrone.schema = {
  providerId: joi.string().required(),
  requestId: joi.string().required(),
  entity: joi.object().keys({
    droneId: joi.string().required(),
    scheduledLaunchDate: joi.string().required(),
    specialRequirements: joi.array().items(joi.string()),
    notes: joi.string(),
  }).required(),
};
/**
 * Assign drone to a pending request of the current logged in user. Provider role only.
 * if status is not pending , raise a ArgumentError
 * if drone not belong provider , raise a ArgumentError
 * @param providerId
 * @param requestId
 */

function* assignDrone(providerId, requestId, entity) {
  const request = yield PackageRequest.findOne({provider: providerId, _id: requestId}).populate('service');

  if (!request) {
    throw new errors.NotFoundError('The provider does not have this request');
  }

  if (request.status !== RequestStatus.PENDING && request.status !== RequestStatus.SCHEDULED) {
    throw new errors.ArgumentError(`cannot assign drone in request status = ${request.status}`);
  }

  const drone = yield Drone.findOne({_id: entity.droneId});
  if (!drone) {
    throw new errors.ArgumentError(`provider dont have drone id = ${entity.droneId}`);
  }

  if (drone.provider.toString() !== providerId) {
    throw new errors.NotPermittedError('Current logged in provider does not have permission');
  }

  // if mission not exist , create mission bind it
  let mission = yield Mission.findOne({_id: request.mission});
  if (!mission) {
    mission = yield Mission.create({
      status: MissionStatus.SCHEDULED,
      drone,
      provider: providerId,
      package: request.package,
      pilot: drone.pilots[Math.floor(Math.random() * drone.pilots.length)],
      startingPoint: request.startingPoint,
      destinationPoint: request.destinationPoint,
    });
  }

  mission.drone = drone;
  mission.status = MissionStatus.WAITING;

  mission.weight = request.weight;
  mission.whatToBeDelivered = request.whatToBeDelivered;
  mission.notes = entity.notes;
  mission.scheduledAt = entity.scheduledLaunchDate;
  mission.specialRequirements = entity.specialRequirements;
  yield mission.save();

  request.mission = mission;
  request.launchDate = entity.scheduledLaunchDate;

  yield request.save();
}

/**
 * get a request by provider id and request id
 * @param providerId the provider id
 * @param requestId the request id
 */
function* getSingleByProvider(providerId, requestId) {
  const request = yield PackageRequest.findOne({provider: providerId, _id: requestId})
    .populate('mission').populate('user').populate('package');
  if (!request) {
    throw new errors.NotFoundError('The provider does not have this request');
  }
  const d = request;
  const sanitized = _.pick(d, 'id', 'launchDate', 'whatToBeDelivered', 'weight', 'payout');
  sanitized.startingPoint = d.startingPoint.toObject();
  sanitized.destinationPoint = d.destinationPoint.toObject();
  sanitized.packageName = d.package.name;
  sanitized.serviceName = (yield Service.findOne({_id: d.package.service})).name;
  sanitized.customer = _.pick(d.user, 'firstName', 'lastName', 'phone', 'email');
  sanitized.customer.adress = d.user.address.toObject();
  sanitized.customer.photoUrl = d.user.avatarUrl;
  sanitized.distance = helper.getFlatternDistance(sanitized.startingPoint.coordinates, sanitized.destinationPoint.coordinates);

  if (d.mission) {
    const pilot = _.pick(yield User.findOne({_id: d.mission.pilot}), '_id', 'name');
    sanitized.mission = _.pick(d.mission, 'id', 'status', 'startedAt', 'gallery',
      'completedAt', 'telemetry', 'eta', 'frontCameraUrl', 'backCameraUrl');
    sanitized.mission.gallery = _.map(d.mission.gallery, (g) => g.toObject());
    sanitized.mission.startingPoint = d.mission.startingPoint.toObject();
    sanitized.mission.destinationPoint = d.mission.destinationPoint.toObject();
    sanitized.mission.pilot = {id: pilot._id, name: pilot.name};
  }
  return sanitized;
}


missionEstimation.schema = {
  providerId: joi.string().required(),
  requestId: joi.string().required(),
  entity: joi.object().keys({
    launchTime: joi.string().required(),
    speed: joi.number().required(),
    distance: joi.number().required(),
    time: joi.number().required(),
  }).required(),
};
/**
 * Update mission estimation of an in-progress request of the current logged in user. Provider role only.
 * @param providerId
 * @param requestId
 * @param entity
 */
function* missionEstimation(providerId, requestId, entity) {
  const request = yield _getSingleByProvider(providerId, requestId);
  if (!request.mission) {
    throw new errors.ArgumentError(`the request dont have mission , request id = ${requestId}`);
  }

  return yield MissionService.estimation(request.mission.toString(), entity);
}


missionTelemetry.schema = {
  providerId: joi.string().required(),
  requestId: joi.string().required(),
  entity: joi.object().keys({
    startedAt: joi.date().required(),
    completedAt: joi.date().required(),
    distance: joi.number().required(),
    averageSpeed: joi.number().required(),
    maxSpeed: joi.number().required(),
    minSpeed: joi.number().required(),
    gallery: joi.array().items(joi.object().keys({
      thumbnailUrl: joi.string(),
      videoUrl: joi.string(),
      imageUrl: joi.string(),
    })),
  }).required(),
};


/**
 * Update mission telemetry of a completed request of the current logged in user. Provider role only.
 *
 * put values to mission telemetry, and update mission result
 * @param providerId
 * @param requestId
 * @param entity
 */
function* missionTelemetry(providerId, requestId, entity) {
  const request = yield _getSingleByProvider(providerId, requestId);
  if (!request.mission) {
    throw new errors.ArgumentError(`the request dont have mission , request id = ${request._id}`);
  }
  return yield MissionService.telemetry(request.mission.toString(), entity);
}

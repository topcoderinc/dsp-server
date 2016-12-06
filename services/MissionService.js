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
const MissioNStatus = require('../enum').MissionStatus;
const Service = require('../models').Service;
const errors = require('common-errors');
const ObjectId = require('mongoose').Types.ObjectId;
const DroneService = require('./DroneService');

// Exports
module.exports = {
  search,
  getSingle,
  estimation,
  telemetry,
  monthlyCountByDrone,
  getAllByDrone,
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
    items: _.map(docs, (d) => ({id: d.id, package: d.package.toObject()})),
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
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  if (mission.pilot.toString() !== userId) {
    throw new errors.HttpStatusError(403, 'no permission');
  }
  return mission.toObject();
}


estimation.schema = {
  id: joi.string().required(),
  entity: joi.object().keys({
    launchTime: joi.string().required(),
    speed: joi.number().required(),
    distance: joi.number().required(),
    time: joi.number().required(),
  }).required(),
};

/**
 *  update mission estimation values
 * @param id
 * @param entity
 */
function * estimation(id, entity) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  mission.estimation = entity;
  yield mission.save();
}


telemetry.schema = {
  id: joi.string().required(),
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
 *  update mission telemetry values
 *  put values to mission telemetry, and update mission result
 *  update drone currentLocation
 *  update mission gallery
 * @param id
 * @param entity
 */
function* telemetry(id, entity) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  mission.telemetry = {
    lat: 0,
    long: 0,
    speed: entity.averageSpeed,
    distance: entity.distance,
  };

  mission.gallery.concat(entity.gallery);

  const avgSpeed = mission.result.avgSpeed ? mission.result.avgSpeed : entity.averageSpeed;

  mission.result = {
    distance: mission.result.distance + entity.distance,
    time: mission.result.time + new Date(entity.completedAt).getTime() - new Date(entity.startedAt).getTime(),
    avgSpeed: (avgSpeed + entity.averageSpeed) * 0.5,
    maxSpeed: Math.max(mission.result.maxSpeed, entity.maxSpeed),
    minSpeed: Math.max(mission.result.minSpeed, entity.minSpeed),
  };

  yield mission.save();
}

monthlyCountByDrone.schema = {
  droneId: joi.string().required(),
  entity: joi.object().keys({
    month: joi.date().required(),
  }).required(),
};

/**
 * get mission monthly count by drone
 * @param droneId
 * @param entity
 */
function* monthlyCountByDrone(droneId, entity) {
  yield DroneService.getSingle(droneId);
  const s = new Date(entity.month);
  const e = new Date(s.getFullYear(), s.getMonth() + 1, 1);

  const docs = yield Mission.aggregate([{
    $match: {
      $and: [
        {drone: ObjectId(droneId)},
        {startedAt: {$gte: s, $lte: e}},
      ],
    },
  }, {
    $group: {_id: {$dayOfMonth: '$startedAt'}, count: {$sum: 1}},
  }]);
  return _.map(docs, (d) => ({
    date: new Date(s.getFullYear(), s.getMonth(), d._id).format('yyyy-MM-dd'),
    count: d.count,
  }));
}


getAllByDrone.schema = {
  droneId: joi.string().required(),
  entity: joi.object().keys({
    date: joi.date(),
    limit: joi.number().integer(),
    status: joi.string().valid(_.values(MissioNStatus)),
    offset: joi.number().integer(),
  }).required(),
};
/**
 * get all mission by drone
 * @param droneId
 * @param entity
 * @return {Array}
 */
function* getAllByDrone(droneId, entity) {
  yield DroneService.getSingle(droneId);

  const querySet = {drone: droneId};

  if (!_.isNil(entity.date)) {
    const date = new Date(entity.date);
    querySet.startedAt = {$gte: date, $lte: date.getTime() + (24 * 60 * 60 * 1000)};
  }

  const docs = yield Mission.find(querySet).sort({startedAt: -1})
    .populate('package').skip(entity.offset || 0).limit(entity.limit || 0);
  const ret = [];
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const sanz = _.pick(d, 'startedAt', 'rating', 'whatToBeDelivered', 'weight');
    sanz.id = d._id;
    sanz.serviceName = (yield Service.findOne({_id: d.package.service})).name;
    sanz.startingPoint = d.startingPoint.toObject();
    sanz.destinationPoint = d.destinationPoint.toObject();
    ret.push(sanz);
  }
  return ret;
}

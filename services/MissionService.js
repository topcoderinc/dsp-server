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
const enums = require('../enum');
const Service = require('../models').Service;
const Category = require('../models').Category;
const Package = require('../models').Package;
const Question = require('../models').Question;
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
  create,
  update,
  remove,
  download,
  getPilotChecklist,
  updatePilotChecklist,
  fetchPilotMissions,
};

// the joi schema for search
search.schema = {
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer(),
  }).required(),
};

/**
 * Search missions in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* search(entity) {
  const total = yield Mission.find().count();
  const docs = yield Mission.find().skip(entity.offset || 0).limit(entity.limit || 100).populate('packageRequest');
  return {
    total,
    items: _.map(docs, (d) => (d.toObject())),
  };
}


// the joi schema for getSingle
getSingle.schema = {
  id: joi.string().required(),
};

/**
 * Get a mission identified by id
 */
function* getSingle(id) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }
  return mission.toObject();
}

/**
 * Get a mission identified by id
 */
function* create(entity) {
  const created = yield Mission.create(entity);
  return created.toObject();
}

/**
 * Get a mission identified by id
 */
function* update(id, entity) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError('Mission not found');
  }
  _.extend(mission, entity);
  yield mission.save();
  return mission.toObject();
}

/**
 * Delete a mission identified by id
 */
function* remove(id) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError('Mission not found');
  }
  yield mission.remove();
}

/**
 * Prepare a mission file from the specified parameters, plannedHomePosition, missionItems
 * @return {Object}       the mission file schema
 */
function prepareMissionFile(plannedHomePosition, missionItems) {
  return {
    MAV_AUTOPILOT: 4,
    complexItems: [],
    groundStation: 'QGroundControl',
    items: missionItems,
    plannedHomePosition,
    version: '1.0',
  };
}

/**
 * Get a mission identified by id
 */
function* download(id) {
  const mission = yield Mission.findOne({_id: id});
  if (!mission) {
    throw new errors.NotFoundError('Mission not found');
  }
  const missionFile = prepareMissionFile(mission.plannedHomePosition, mission.missionItems);
  return {
    missionFile,
    name: mission.missionName,
  };
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
    status: joi.string().valid(_.values(enums.MissionStatus)),
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

  if (entity.status) {
    querySet.status = entity.status;
  }

  if (!_.isNil(entity.date)) {
    const date = new Date(entity.date);
    querySet.startedAt = {$gte: date, $lte: date.getTime() + (24 * 60 * 60 * 1000)};
  }

  const docs = yield Mission.find(querySet).sort({startedAt: -1})
    .populate('packageRequest').skip(entity.offset || 0).limit(entity.limit || 0);
  const ret = [];
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const pack = (yield Package.findOne({_id: d.packageRequest.package}));
    const service = (yield Service.findOne({_id: pack.service}));
    const category = (yield Category.findOne({_id: service.category}));
    const sanz = _.pick(d, 'startedAt', 'rating', 'whatToBeDelivered', 'weight', 'missionName', 'completedAt', 'scheduledAt');
    sanz.id = d._id;
    sanz.serviceName = service.name;
    sanz.serviceType = category.name;
    sanz.startingPoint = d.startingPoint.toObject();
    sanz.destinationPoint = d.destinationPoint.toObject();
    ret.push(sanz);
  }
  return ret;
}


// the joi schema for getPilotChecklist
getPilotChecklist.schema = {
  id: joi.string().required(),
  pilotId: joi.string().required(),
};

/**
 * Get a pilot checklist for a certain mission
*
 * @param   {String}   id               mission id
 * @param   {String}   pilotId          pilot id
 * @return  {Object}   mission name, mission status, question list and a pilot checklist if available
 */
function* getPilotChecklist(id, pilotId) {
  const mission = yield Mission.findOne({_id: id});

  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  if (mission.pilot.toString() !== pilotId) {
    throw new errors.NotPermittedError(`current logged in pilot is not assigned to the mission with specified id ${id}`);
  }

  const response = {
    missionName: mission.missionName,
    missionStatus: mission.status,
  };
  // get questions texts to send them in response
  response.questions = yield Question.find();

  // if there are any answers, then add them to response
  if (mission.pilotChecklist) {
    response.pilotChecklist = _.omit(mission.pilotChecklist.toObject(), ['user']);
  }

  return response;
}

// the joi schema for updatePilotChecklist's answer
const answersSchema = {
  question: joi.string().required(),
  answer: joi.string().valid(_.values(enums.PilotChecklistAnswers)),
  note: joi.string(),
};
// the joi schema for updatePilotChecklist
updatePilotChecklist.schema = {
  id: joi.string().required(),
  pilotId: joi.string().required(),
  entity: joi.object().keys({
    answers: joi.array().items(joi.object(answersSchema)).required(),
    load: joi.bool(),
  }).required(),
};

/**
 * Update a pilot checklist for a certain mission
 *
 * @param   {String}   id               mission id
 * @param   {String}   pilotId          pilot id
 * @param   {Object}   entity
 * @param   {Array}    entity.answers   array of answers
 * @param   {Boolean}  entity.load      flag to load mission
 * @return  {Object}   pilot checklist and mission status
 */
function* updatePilotChecklist(id, pilotId, entity) {
  const mission = yield Mission.findOne({_id: id});

  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  if (mission.pilot.toString() !== pilotId) {
    throw new errors.NotFoundError(`current logged in pilot is not assigned to the mission with specified id ${id}`);
  }

  if (!mission.pilotChecklist) {
    mission.pilotChecklist = {};
  }

  mission.pilotChecklist.user = pilotId;
  mission.pilotChecklist.answers = entity.answers;
  if (entity.load) {
    mission.status = 'in-progress';
  }
  yield mission.save();

  const response = {
    missionStatus: mission.status,
  };
  response.pilotChecklist = _.omit(mission.pilotChecklist.toObject(), ['user']);

  return response;
}

// the joi schema for fetchPilotMissions
fetchPilotMissions.schema = {
  pilotId: joi.string(),
  entity: joi.object().keys({
    offset: joi.number().integer(),
    limit: joi.number().integer(),
    sortBy: joi.string(),
  }).required(),
};

/**
 * Fetch pilot missions
 *
 * @param   {String}   pilotId    pilot id
 * @param   {Object}   entity     parameters of request: limit, offset, sortBy
 * @return  {Object}   missions
 */
function* fetchPilotMissions(pilotId, entity) {
  const query = {pilot: pilotId};
  const sortBy = {};

  if (entity.sortBy) {
    const direction = entity.sortBy[0] === '-' ? -1 : 1;
    const field = entity.sortBy[0] === '-' ? entity.sortBy.slice(1) : entity.sortBy;

    sortBy[field] = direction;
  }

  const total = yield Mission.find(query).count();
  const docs = yield Mission.find(query)
    .skip(entity.offset || 0)
    .limit(entity.limit || 100)
    .sort(sortBy);

  return {
    total,
    items: _.map(docs, (d) => (_.pick(d.toObject(), ['id', 'missionName', 'status']))),
  };
}

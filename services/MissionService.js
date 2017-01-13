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
const httpStatus = require('http-status');
const rp = require('request-promise');
const logger = require('../common/logger');

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
  checkDroneStatus,
  loadMissionToDrone,
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
  const mission = yield Mission.findOne({_id: id}).populate({path: 'drone'});

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
    // pilot clicked save and load button, so send mission to drone
    yield sendMissionToDrone(pilotId, mission);
    mission.status = enums.MissionStatus.IN_PROGRESS;
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
 * Synchronous utility function to convert mission items into an format understandable by drone
 * to be sent to drone
 * @param  {Object}   missionItems      the mission items to convert
 * @return {Object}                     the converted mission items
 */
function convertMissionItems(missionItems) {
  const response = [];
  for (let i = 0; i < missionItems.length; i += 1) {
    const single = missionItems[i];
    response.push({
      param1: single.param1,
      param2: single.param2,
      param3: single.param3,
      param4: single.param4,
      x: single.coordinate[1],
      y: single.coordinate[0],
      z: single.coordinate[2],
      seq: i,
      command: single.command,
      target_system: 1,
      target_component: 190,
      frame: single.frame,
      current: 0,
      autocontinue: 1,
    });
  }
  return response;
}

sendMissionToDrone.schema = {
  sub: joi.string().required(),
  missionId: joi.string().required(),
};

/**
 * Send the mission to the drone
 * This is a part of loading mission onto the drone.
 * It involves two steps
 * 1. Transforming the mission waypoints data into a format
 *    understandable by drone
 * 2. Firing http post request to drone
 *
 * @param   {String}   mission          the mission to load to drone
 * @param   {String}   sub              the currently logged in user
 */
function* sendMissionToDrone(sub, mission) {
  if (mission.status === enums.MissionStatus.COMPLETED) {
    throw new errors.ValidationError('cannot send mission to drone for completed mission', httpStatus.BAD_REQUEST);
  }
  if (!mission.drone || !mission.drone.accessURL) {
    throw new errors.ValidationError('cannot send mission, drone is not assigned ' +
      'or drone accessURL is not defined', httpStatus.BAD_REQUEST);
  }
  if (!mission.pilotChecklist) {
    throw new errors.ValidationError('cannot send mission, checlist is not completed', httpStatus.BAD_REQUEST);
  }
  if (!mission.missionItems) {
    throw new errors.ValidationError('cannot send mission, mission waypoints are not defined', httpStatus.BAD_REQUEST);
  }
  if (sub !== mission.pilot.toString()) {
    throw new errors.NotPermittedError('loggedin user is not pilot for this mission');
  }

  // convert the waypoints to format understandable by drone
  const missionData = convertMissionItems(mission.missionItems);
  // send the mission to drone
  const droneResponse = yield rp({
    method: 'POST',
    uri: `${mission.drone.accessURL}/mission`,
    body: missionData,
    json: true,
  });

  logger.info(`mission ${mission.id} sent to drone, response from drone`, droneResponse);
}

/**
 * Load the mission to the drone
 *
 * @param   {String}   missionId        the id of the mission to load to drone
 * @param   {String}   sub              the currently logged in user
 */
function* loadMissionToDrone(sub, missionId) {
  const mission = yield Mission.findById(missionId).populate({path: 'drone'});
  yield sendMissionToDrone(sub, mission);
  mission.status = enums.MissionStatus.IN_PROGRESS;
  yield mission.save();
}


/**
 * Send a HTTP GET Request to drone accessURL
 * If api returns 200 than drone is online, otherwise offline
 * @param {String}    accessURL     the drone accessURL
 * @return                          true if drone is online otherwise false
 */
function* checkDroneOnline(accessURL) {
  try {
    yield rp.get(accessURL);
    return true;
  } catch (error) {
    logger.error(`drone ${accessURL} is not online, reason`, JSON.stringify(error));
    return false;
  }
}

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
    .populate({path: 'drone'})
    .sort(sortBy);

  const items = [];
  for (let i = 0; i < docs.length; i += 1) {
    const sanz = _.pick(docs[i].toObject(), 'id', 'missionName', 'status', 'pilotChecklist',
      'drone.id', 'drone.name', 'drone.accessURL');
    let droneOnline = false;
    // if drone is assigned
    if (sanz.drone && sanz.drone.accessURL) {
      droneOnline = yield checkDroneOnline(sanz.drone.accessURL);
    }
    items.push(_.extend(sanz, {droneOnline}));
  }

  return {
    total,
    items,
  };
}

function* checkDroneStatus(sub, missionId) {
  const mission = yield Mission.findById(missionId).populate({path: 'drone'});
  if (!mission) {
    throw new errors.NotFoundError('mission not found with specified id');
  }
  if (mission.status === enums.MissionStatus.COMPLETED) {
    throw new errors.ValidationError('cannot check drone status for completed mission', httpStatus.BAD_REQUEST);
  }
  if (!mission.drone || !mission.drone.accessURL) {
    throw new errors.ValidationError('cannot check drone status, drone is not assigned ' +
      'or drone accessURL is not defined', httpStatus.BAD_REQUEST);
  }
  if (sub !== mission.pilot.toString()) {
    throw new errors.NotPermittedError('loggedin user is not pilot for this mission');
  }
  let currentPosition = yield rp({
    method: 'GET',
    uri: `${mission.drone.accessURL}/telemetry/global_position_int`,
    json: true,
  });

  if (currentPosition.result !== 'success') {
    throw new errors.data.DataError('drone position status is not success');
  }
  currentPosition = currentPosition.data;
  // convert 1E7 scientific format lat/lon to normal latitude and longitude
  currentPosition.lat *= 0.0000001;
  currentPosition.lon *= 0.0000001;
  const waypoints = yield rp({
    method: 'GET',
    uri: `${mission.drone.accessURL}/mission`,
    json: true,
  });

  return {
    currentPosition,
    waypoints,
  };
}

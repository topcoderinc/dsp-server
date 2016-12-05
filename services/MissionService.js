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

const models = require('../models');

const Mission = models.Mission;
const helper = require('../common/helper');
const errors = require('common-errors');

const _ = require('lodash');

// Exports
module.exports = {
  create,
  update,
  getAll,
  search,
  getSingle,
  deleteMission,
  download,
};

// the mission item schema definition
const missionItemSchema = joi.object().keys({
  autoContinue: joi.boolean().required(),
  command: joi.number().integer().required(),
  coordinate: joi.array().items(joi.number().required(), joi.number().required(), joi.number().required()).required(),
  frame: joi.number().integer().required(),
  id: joi.number().integer().required(),
  param1: joi.number().integer().required(),
  param2: joi.number().required(),
  param3: joi.number().required(),
  param4: joi.number().required(),
  type: joi.string().allow('missionItem').required(),
}).required();

// the joi schema for create
create.schema = {
  auth: joi.object().required(),
  entity: joi.object().keys({
    plannedHomePosition: missionItemSchema,
    missionItems: joi.array().min(1).items(missionItemSchema).required(),
    missionName: joi.string().required(),
  }).required(),
};

/**
 * Create a mission in the system.
 *
 * @param {Object}    entity          the parsed request body
 */
function* create(auth, entity) {
  const mission = entity;
  mission.userId = auth.sub;
  const created = yield Mission.create(mission);
  return created.toObject();
}

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

// the joi schema for update
update.schema = {
  id: joi.string().required(),
  entity: joi.object().keys({
    plannedHomePosition: missionItemSchema,
    missionItems: joi.array().min(1).items(missionItemSchema).required(),
    missionName: joi.string().required(),
  }).required(),
};

/**
 * Update a Mission in the system
 *
 * @param {String}    id              the id of the mission to update
 * @param {Object}    entity          the parsed request body
 */
function* update(id, entity) {
  // update the position history
  const mission = yield Mission.findOne({ _id: id });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }

  _.extend(mission, entity);

  yield mission.save();

  return mission.toObject();
}

getAll.schema = {
  auth: joi.object().required(),
};

/**
 * Get a list of all the missions
 */
function* getAll(auth) {
  const docs = yield Mission.find({ userId: auth.sub });
  return helper.sanitizeArray(docs);
}

// the joi schema for getSingle
getSingle.schema = {
  id: joi.string().required(),
};

/**
 * Get a mission identified by id
 */
function* getSingle(id) {
  const mission = yield Mission.findOne({ _id: id });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }
  return mission.toObject();
}

// the joi schema for deleteMission
deleteMission.schema = {
  id: joi.string().required(),
};

/**
 * Delete a mission identified by id
 */
function* deleteMission(id) {
  const mission = yield Mission.findOne({ _id: id });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }
  yield mission.remove();
}

// the joi schema for download
download.schema = {
  id: joi.string().required(),
};

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
 * Download a mission file supported by QGroundControl identified by id
 */
function* download(id) {
  const mission = yield Mission.findOne({ _id: id });
  if (!mission) {
    throw new errors.NotFoundError(`mission not found with specified id ${id}`);
  }
  const missionFile = prepareMissionFile(mission.plannedHomePosition, mission.missionItems);
  return {
    missionFile,
    name: mission.missionName,
  };
}

/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate packageRequest in the system
 * This includes create a packageRequest
 *
 * @author      TCSCODER
 * @version     1.0
 */

const _ = require('lodash');
const PackageRequestService = require('../services/PackageRequestService');
const helper = require('../common/helper');
// Exports
module.exports = {
  create,
  get,
  getSingle,
  search,
  accept,
  reject,
  assignDrone,
  cancel,
  complete,
  getSingleByProvider,
  missionEstimation,
  missionTelemetry,
};

/**
 * Create a packageRequest in the system
 *
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  const entity = _.extend(req.body, {user: req.auth.sub, package: req.params.id});
  res.status(201).json(yield PackageRequestService.create(entity));
}

/**
 * get all packageRequests of current user in the system
 *
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.json(yield PackageRequestService.get(req.auth.sub, req.query));
}


function* getSingle(req, res) {
  res.json(yield PackageRequestService.getSingle(req.auth.sub, req.params.id));
}

/**
 *  get all packageRequests of current provider and lauchDate,statuses
 * @param req
 * @param res
 */
function* search(req, res) {
  yield helper.splitQueryToArray(req.query, 'statuses');
  res.json(yield PackageRequestService.search(req.auth.payload.providerId, req.query));
}

/**
 * get a request detail by provider and request id
 * @param req
 * @param res
 */
function* getSingleByProvider(req, res) {
  res.json(yield PackageRequestService.getSingleByProvider(req.auth.payload.providerId, req.params.id));
}
/**
 * accept a request by provider and request id
 * @param req
 * @param res
 */
function* accept(req, res) {
  res.json(yield PackageRequestService.accept(req.auth.payload.providerId, req.params.id));
}

/**
 * reject a request by provider and request id
 * @param req
 * @param res
 */
function* reject(req, res) {
  res.json(yield PackageRequestService.reject(req.auth.payload.providerId, req.params.id));
}

/**
 * reject a request by provider and request id
 * @param req
 * @param res
 */
function* cancel(req, res) {
  res.json(yield PackageRequestService.cancel(req.auth.payload.providerId, req.params.id));
}

/**
 * Assign drone to a pending request of the current logged in user. Provider role only.
 * @param req
 * @param res
 */
function* assignDrone(req, res) {
  res.json(yield PackageRequestService.assignDrone(req.auth.payload.providerId, req.params.id, req.body));
}

/**
 * complete a request by provider and request id
 * @param req
 * @param res
 */
function* complete(req, res) {
  res.json(yield PackageRequestService.complete(req.auth.payload.providerId, req.params.id));
}

function* missionEstimation(req, res) {
  res.json(yield PackageRequestService.missionEstimation(req.auth.payload.providerId, req.params.id, req.body));
}
function* missionTelemetry(req, res) {
  res.json(yield PackageRequestService.missionTelemetry(req.auth.payload.providerId, req.params.id, req.body));
}

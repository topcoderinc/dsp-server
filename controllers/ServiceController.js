/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate users in the system
 * This includes auth, social auth and register
 *
 * @author      TCSCODER
 * @version     1.0
 */

const ServiceService = require('../services/ServiceServices');

module.exports = {
  create,
  update,
  deleteSingle,
  getSingle,
  getAll,
};

function * create(req, res) {
  res.json(yield ServiceService.create(req.auth.payload.providerId, req.body));
}

function *update(req, res) {
  res.json(yield ServiceService.update(req.auth.payload.providerId, req.params.id, req.body));
}

function* getSingle(req, res) {
  res.json(yield ServiceService.getSingle(req.params.id));
}

function* deleteSingle(req, res) {
  res.json(yield ServiceService.deleteSingle(req.auth.payload.providerId, req.params.id), 204);
}

function* getAll(req, res) {
  res.json(yield ServiceService.getAll(req.auth.payload.providerId, req.query));
}

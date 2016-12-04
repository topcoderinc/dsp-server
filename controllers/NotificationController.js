/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to manipulate notifications in the system
 * This includes read a notification
 * and get all savedPackages for current user
 *
 * @author      TCSCODER
 * @version     1.0
 */

const NotificationService = require('../services/NotificationService');

// Exports
module.exports = {
  read,
  get,
};

/**
 * Get all notifications of current user in the system
 *
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.json(yield NotificationService.get(req.auth.sub));
}

/**
 * Set a notification as read in the system
 *
 * @param req the request
 * @param res the response
 */
function* read(req, res) {
  yield NotificationService.read(req.auth.sub, req.params.id);
  res.status(204).end();
}

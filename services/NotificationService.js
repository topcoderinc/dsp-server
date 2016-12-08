/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Notification module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const httpStatus = require('http-status');

const Notification = require('../models').Notification;
const helper = require('../common/helper');
const errors = require('common-errors');
const _ = require('lodash');
const NotificationType = require('../enum').NotificationType;


// Exports
module.exports = {
  get,
  read,
  create,
};


create.schema = {
  userId: joi.string().required(),
  type: joi.string().valid(_.values(NotificationType)).required(),
  values: joi.object().required(),
};

/**
 * create notification to user
 * @param userId
 * @param type
 * @param values
 */
function* create(userId, type, values) {
  yield Notification.create({
    user: userId,
    type,
    values,
  });
}

// the joi schema for create
read.schema = {
  userId: joi.string().required(),
  notificationId: joi.string().required(),
};
/**
 * Set a notification as read in the system.
 *
 * @param {String}    userId          the user id
 * @param {String}    notificationId       the notification id
 *
 */
function* read(userId, notificationId) {
  const doc = yield Notification.findOne({_id: notificationId});
  if (!doc) {
    throw new errors.NotFoundError(`notification not found with specified id ${notificationId}`);
  }
  if (doc.user.toString() !== userId) {
    throw new errors.HttpStatusError(403, 'no permission');
  }
  if (doc.read) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, 'notification is already read');
  }
  doc.read = true;
  doc.readAt = new Date();

  yield doc.save();
}

// the joi schema for get
get.schema = {
  id: joi.string().required(),
};

/**
 * get all notification for current user
 *
 * @param {String}    id          the user id
 */
function* get(id) {
  const docs = yield Notification.find({user: id});
  return helper.sanitizeArray(docs);
}

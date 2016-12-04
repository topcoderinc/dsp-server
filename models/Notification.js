/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Notification model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const helper = require('../common/helper');
const enums = require('../enum');

const Schema = mongoose.Schema;

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: _.values(enums.NotificationType), required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  values: { type: Schema.Types.Mixed },
  read: Boolean,
  readAt: Date,
});

NotificationSchema.plugin(timestamps);

helper.sanitizeSchema(NotificationSchema);

module.exports = {
  NotificationSchema,
};

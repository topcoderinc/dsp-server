/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The NoFlyZone model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');
const helper = require('../common/helper');

const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

const NoFlyZoneSchema = new mongoose.Schema({
  location: {type: Mixed, required: true, index: '2dsphere'},
  description: String,
  startTime: Date,
  endTime: Date,
  // styles for google map
  style: {type: Mixed, default: {}},
  isActive: {type: Boolean, required: true},
  isPermanent: {type: Boolean, required: true},
  mission: {type: ObjectId, ref: 'Mission'},
});

NoFlyZoneSchema.plugin(timestamps);

helper.sanitizeSchema(NoFlyZoneSchema);

module.exports = {
  NoFlyZoneSchema,
};

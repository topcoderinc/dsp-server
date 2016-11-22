/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The DronePostion model to store the historic position of a drone
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');
const helper = require('../common/helper');

const DronePositionSchema = new mongoose.Schema({
  droneId: { type: mongoose.Schema.ObjectId, required: true, refs: 'Drone' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

DronePositionSchema.plugin(timestamps);

helper.sanitizeSchema(DronePositionSchema);

module.exports = {
  DronePositionSchema,
};

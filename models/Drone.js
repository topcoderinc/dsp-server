/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Drone model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');
const DroneStatus = require('../enum').DroneStatus;
const DroneType = require('../enum').DroneType;
const _ = require('lodash');

const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

const DroneSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: { type: String, required: false },
  status: {type: String, enum: _.values(DroneStatus), required: true},
  // realtime coordinate of the drone
  currentLocation: {type: [Number], index: {type: '2dsphere', sparse: true}},
  deviceId: { type: String, required: false },
  provider: {type: ObjectId, required: false, ref: 'Provider'},
  pilots: {type: [{type: ObjectId, ref: 'User'}]},
  serialNumber: {type: String, required: true},
  accessories: {type: Mixed},
  system: {type: String},
  maxFlightTime: {type: Number},
  maxBatteryTime: {type: Number},
  // mileage is added whenever the drone completes a mission
  mileage: {type: Number, required: true, default: 0.0},
  imageUrl: String,
  thumbnailUrl: String,
  type: {type: String, enum: _.values(DroneType)},
  specificationContent: String, // Specifications and Benefits
  specificationImageUrl: String,
  specificationPDFUrl: String,

  minSpeed: Number,
  maxSpeed: Number,
  maxCargoWeight: Number,
  maxAltitude: Number,
  cameraResolution: Number,
  videoResolution: Number,
  hasWiFi: Boolean,
  hasBluetooth: Boolean,
  engineType: String,
  numberOfRotors: Number,
  hasAccelerometer: Boolean,
  hasGyroscope: Boolean,
  hasRadar: Boolean,
  hasGPS: Boolean,
  hasObstacleSensors: Boolean,
  hasUltraSonicAltimeter: Boolean,
});

DroneSchema.plugin(timestamps);


if (!DroneSchema.options.toObject) {
  DroneSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
DroneSchema.options.toObject.transform = function (doc, ret, options) {
  const sanitized = _.omit(ret, '__v', '_id', 'provider', 'createdAt', 'updatedAt', 'pilots');
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  DroneSchema,

};

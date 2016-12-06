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

const _ = require('lodash');
const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');

const DronePositionSchema = new mongoose.Schema({
  droneId: { type: mongoose.Schema.ObjectId, required: true, refs: 'Drone' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

DronePositionSchema.plugin(timestamps);


if (!DronePositionSchema.options.toObject) {
  DronePositionSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
DronePositionSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'updatedAt');
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  DronePositionSchema,
};

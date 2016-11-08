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
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const DroneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

DroneSchema.plugin(timestamps);

if (!DroneSchema.options.toObject) {
  DroneSchema.options.toObject = { };
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
DroneSchema.options.toObject.transform = function (doc, ret, options) {    // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id');
  sanitized.id = doc._id;
  return sanitized;
};

module.exports = {
  DroneSchema,
};

/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Mission model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const enums = require('../enum');

const Schema = mongoose.Schema;
const GallerySchema = new Schema({
  thumbnailUrl: String,
  videoUrl: String,
  imageUrl: String,
});

const LocationSchema = new Schema({
  coordinates: { type: [Number], required: true },
  line1: { type: String, required: true },
  line2: { type: String, required: false },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  primary: { type: Boolean, required: true },
});

const MissionSchema = new mongoose.Schema({
  status: { type: String, enum: _.values(enums.MissionStatus), required: false },
  drone: { type: Schema.Types.ObjectId, required: false, ref: 'Drone' },
  provider: { type: Schema.Types.ObjectId, required: false, ref: 'Provider' },
  package: { type: Schema.Types.ObjectId, required: false, ref: 'Package' },
  pilot: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
  startingPoint: {
    type: LocationSchema,
    required: false,
  },
  destinationPoint: {
    type: LocationSchema,
    required: false,
  },
  startedAt: Date,
  completedAt: Date,
    // the current drone real-time values
  telemetry: {
    lat: Number,
    long: Number,
    speed: Number,
    distance: Number,
  },
  eta: Number,
  frontCameraUrl: String,
  backCameraUrl: String,
  gallery: [GallerySchema],
});

MissionSchema.plugin(timestamps);

if (!MissionSchema.options.toObject) {
  MissionSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
MissionSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'createdAt', 'updatedAt', 'package', 'pilot', 'drone');
  sanitized.startingPoint = _.omit(sanitized.startingPoint, '_id');
  sanitized.destinationPoint = _.omit(sanitized.destinationPoint, '_id');
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  MissionSchema,
};

/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The PackageRequest model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const enums = require('../enum');

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  coordinates: { type: [Number], required: true },
  line1: { type: String, required: true },
  line2: { type: String, required: false },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
});

const PackageRequestSchema = new mongoose.Schema({
  package: { type: Schema.Types.ObjectId, required: true, ref: 'Package' },
  provider: { type: Schema.Types.ObjectId, required: true, ref: 'Provider' },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  mission: { type: Schema.Types.ObjectId, required: false, ref: 'Mission' },

  status: { type: String, enum: _.values(enums.RequestStatus), required: true },
  contactInfo: {
    type: {
      recipientName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    required: true,
  },
  destinationPoint: { type: LocationSchema, required: true },

  launchDate: { type: Date, default: Date.now },

  additionalInfo: String,
});

PackageRequestSchema.plugin(timestamps);

if (!PackageRequestSchema.options.toObject) {
  PackageRequestSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
PackageRequestSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'provider', 'package', 'createdAt', 'user', 'updatedAt');
  sanitized.destinationPoint = _.omit(sanitized.destinationPoint, '_id');
  sanitized.id = doc._id;
  return sanitized;
};

module.exports = {
  PackageRequestSchema,
};

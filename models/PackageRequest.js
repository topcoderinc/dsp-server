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
const Address = require('./Address').AddressSchema;

const Schema = mongoose.Schema;

// Region to Fly Zone (RTFZ)
const ZoneSchema = new Schema({
  location: {type: Schema.Types.Mixed, required: true, index: '2dsphere'},
  description: String,
  // styles for google map
  style: {type: Schema.Types.Mixed, default: {}},
});

const PackageRequestSchema = new mongoose.Schema({
  package: {type: Schema.Types.ObjectId, required: true, ref: 'Package'},
  provider: {type: Schema.Types.ObjectId, required: true, ref: 'Provider'},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  mission: {type: Schema.Types.ObjectId, required: false, ref: 'Mission'},


  status: {type: String, enum: _.values(enums.RequestStatus), required: true},
  title: {type: String, required: true},
  contactInfo: {
    type: {
      recipientName: {type: String, required: false},
      phoneNumber: {type: String, required: false},
    },
    required: false,
  },
  description: {type: String },
  startingPoint: {type: Address, required: false},
  destinationPoint: {type: Address, required: false},
  launchDate: {type: Date},
  additionalInfo: String,
  whatToBeDelivered: String,
  weight: Number,
  payout: Number,
  zones: {
    type: [ZoneSchema],
    default: [],
  },
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

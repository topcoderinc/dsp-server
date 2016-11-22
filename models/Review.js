/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Review model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const ReviewSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    // we need to get all reviews for the provider
  provider: { type: Schema.Types.ObjectId, required: true, ref: 'Provider' },
    // review is per mission
  mission: { type: Schema.Types.ObjectId, required: true, ref: 'Mission' },
  publicFeedback: String,
  privateFeedback: String,
  rating: { type: Number, required: true },
});

ReviewSchema.plugin(timestamps);

if (!ReviewSchema.options.toObject) {
  ReviewSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
ReviewSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'updatedAt', 'provider', 'mission');
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  ReviewSchema,
};

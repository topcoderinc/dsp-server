/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Provider model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const Address = require('./Address').AddressSchema;
const enums = require('../enum');

const Schema = mongoose.Schema;


const ProviderSchema = new mongoose.Schema({
  name: {type: String, required: true},
  location: {
    type: [Address],
    required: true,
  },

  status: {type: String, enum: _.values(enums.ProviderStatus), required: true},
  // category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
  // min/max prices from associated packages
  minPrice: Number,
  maxPrice: Number,

  imageUrl: String,
  thumbnailUrl: String,

  // sum of rating of all packages
  rating: {
    type: {
      // number of votes
      count: {type: Number, default: 0},
      // sum of all votes
      sum: {type: Number, default: 0},
      // sum / count
      avg: {type: Number, default: 0},
    },
    required: true,
  },

  // list of keywords to match
  // on every package change, the keywords should be rebuilt
  // it should contain: name, description (from packages also), price, location
  // full-text search doesn't work with $near
  keywords: {type: [String], required: true},

  // the subset of keyword without: price, location
  simpleKeywords: {type: [String], required: true},

});

ProviderSchema.plugin(timestamps);

if (!ProviderSchema.options.toObject) {
  ProviderSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
ProviderSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'createdAt', 'updatedAt', 'keywords', 'simpleKeywords', 'user');
  sanitized.location = _.map(sanitized.location, l => _.omit(l, '_id'));
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  ProviderSchema,
};

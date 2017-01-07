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

const Schema = mongoose.Schema;
const _ = require('lodash');

const ServiceSchema = new Schema({
  provider: {type: Schema.Types.ObjectId, required: true, ref: 'Provider'},
  category: {type: Schema.Types.ObjectId, required: true, ref: 'Category'},
  name: {type: String, required: true},
  pricing: {type: String, required: true},
  description: {type: String, required: true},
});


if (!ServiceSchema.options.toObject) {
  ServiceSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
ServiceSchema.options.toObject.transform = function (doc, ret, options) {
  const sanitized = _.omit(ret, '__v', '_id', 'provider', 'category');
  sanitized.id = doc._id;
  return sanitized;
};

module.exports = {
  ServiceSchema,
};


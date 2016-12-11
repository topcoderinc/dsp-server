/**
 * Represents the schema for Address (embedded type).
 */
'use strict';

const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');
const _ = require('lodash');

const AddressSchema = new mongoose.Schema({
  // format [longitude, latitude]
  // needed for $near query https://docs.mongodb.com/manual/reference/operator/query/near/
  coordinates: {type: [Number], required: true, index: '2dsphere'},
  line1: {type: String, required: true},
  line2: {type: String, required: false},
  city: {type: String, required: true},
  state: {type: String, required: true},
  postalCode: {type: String, required: true},
  primary: {type: Boolean, required: true},
});

AddressSchema.plugin(timestamps);

if (!AddressSchema.options.toObject) {
  AddressSchema.options.toObject = {};
}

AddressSchema.options.toObject.transform = function (doc, ret) {
  const sanitized = _.omit(ret, '__v', '_id', 'createdAt', 'updatedAt');
  return sanitized;
};


module.exports = {
  AddressSchema,
};

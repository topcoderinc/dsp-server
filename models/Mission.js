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

const MissionSchema = new mongoose.Schema({
  missionName: { type: String, required: true },
  userId: { type: String, required: true },
  plannedHomePosition: { type: mongoose.Schema.Types.Mixed, required: true },
  missionItems: { type: mongoose.Schema.Types.Mixed, required: true },
});

MissionSchema.plugin(timestamps);

if (!MissionSchema.options.toObject) {
  MissionSchema.options.toObject = { };
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
MissionSchema.options.toObject.transform = function (doc, ret, options) {    // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id');
  sanitized.id = doc._id;
  return sanitized;
};

module.exports = {
  MissionSchema,
};

/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Category model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const timestamps = require('mongoose-timestamp');
const helper = require('../common/helper');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

CategorySchema.plugin(timestamps);

helper.sanitizeSchema(CategorySchema);

module.exports = {
  CategorySchema,
};

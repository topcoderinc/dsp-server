/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Question model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const helper = require('../common/helper');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

helper.sanitizeSchema(QuestionSchema);

module.exports = {
  QuestionSchema,
};

/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Category module API's
 *
 * @author      TCSCODER
 * @version     1.0
 */

const Category = require('../models').Category;
const helper = require('../common/helper');

// Exports
module.exports = {
  getAll,
};

/**
 * Get a list of all the drones
 */
function* getAll() {
  const docs = yield Category.find({ });
  return helper.sanitizeArray(docs);
}


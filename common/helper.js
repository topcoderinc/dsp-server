/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Contains generic helper methods
 *
 * @author      TSCCODER
 * @version     1.0
 */

const _ = require('lodash');
const co = require('co');
const bcrypt = require('bcryptjs');

global.Promise.promisifyAll(bcrypt);

module.exports = {
  wrapExpress,
  autoWrapExpress,
  sanitizeArray,
  hashString,
  validateHash,
};

/**
 * Wrap generator function to standard express function
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function (req, res, next) {
    co(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap all generators from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress);
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'GeneratorFunction') {
      return wrapExpress(obj);
    }
    return obj;
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value);
  });
  return obj;
}

/**
 * Helper method to sanitize the Array
 * Sanitization means convert the mongoose model into plain javascript object and remove '_id' and append 'id' field
 *
 * @param {arry}      Array         the array to sanitize
 */
function sanitizeArray(arry) {
  if (_.isArray(arry)) {
    const response = [];
    _.forEach(arry, (single) => {
      response.push(single.toObject());
    });
    return response;
  }
  return arry.toObject();
}

/**
 * Validate that the hash is actually the hashed value of plain text
 *
 * @param {String}    hash          the hash to validate
 * @param {String}    text          the text to validate against
 */
function* validateHash(hash, text) {
  return yield bcrypt.compareAsync(text, hash);
}

/**
 * Hash the plain text using the specified number of rounds
 *
 * @param {String}    text          the text to hash
 * @param {Integer}   rounds        the number of rounds
 */
function* hashString(text, rounds) {
  return yield bcrypt.hashAsync(text, rounds);
}


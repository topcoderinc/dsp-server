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
const errors = require('common-errors');
const httpStatus = require('http-status');
const ObjectId = require('../datasource').getMongoose().Types.ObjectId;

global.Promise.promisifyAll(bcrypt);

module.exports = {
  wrapExpress,
  autoWrapExpress,
  sanitizeArray,
  hashString,
  validateHash,
  sanitizeSchema,
  validateObjectId,
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

/**
 * Helper method to sanitize mongoose model schema
 * @param  {Object} schema mongoose model schema
 */
function sanitizeSchema(schema) {
  if (!schema.options.toObject) {
    schema.options.toObject = {};
  }

    /**
     * Transform the given document to be sent to client
     *
     * @param  {Object}   doc         the document to transform
     * @param  {Object}   ret         the already converted object
     * @param  {Object}   options     the transform options
     */
  schema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
    const sanitized = _.omit(ret, '__v', '_id', 'createdAt', 'updatedAt');
    sanitized.id = doc._id;
    return sanitized;
  };
}

/**
 * Helper method to validate that string is id or not
 * @param  {String} id the string to validate
 */
function validateObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new errors.HttpStatusError(httpStatus.BAD_REQUEST, `id ${id} is not valid`);
  }
}

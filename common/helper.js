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

global.Promise.promisifyAll(bcrypt);

module.exports = {
  wrapExpress,
  autoWrapExpress,
  sanitizeArray,
  hashString,
  validateHash,
  sanitizeSchema,
  getFlatternDistance,
  splitQueryToArray,
};

/**
 * split query array to json array
 * example:
 *  a,b,c => [a,b,c]
 * @param query
 * @param name
 */
function* splitQueryToArray(query, name) {
  if (query[name]) {
    try {
      query[name] = query[name].split(',');
    } catch (e) {
      throw new errors.ArgumentError(`${name} must be array`, 400);
    }
  }
}
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
 * approx distance between two points on earth ellipsoid
 * @param coordinates1
 * @param coordinates2
 */
function getFlatternDistance(coordinates1, coordinates2) {
  const lng1 = coordinates1[1];
  const lat1 = coordinates1[0];

  const lng2 = coordinates2[1];
  const lat2 = coordinates2[0];

  if (lng2 === lng1 && lat1 === lat2) {
    return 0;
  }

  function getRad(d) {
    return d * PI / 180.0;
  }

  const EARTH_RADIUS = 6378137.0; // 单位M
  const PI = Math.PI;

  const f = getRad((lat1 + lat2) / 2);
  const g = getRad((lat1 - lat2) / 2);
  const l = getRad((lng1 - lng2) / 2);

  let sg = Math.sin(g);
  let sl = Math.sin(l);
  let sf = Math.sin(f);

  let s,
    c,
    w,
    r,
    d,
    h1,
    h2;
  const a = EARTH_RADIUS;
  const fl = 1 / 298.257;

  sg *= sg;
  sl *= sl;
  sf *= sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;
  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;
  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}


/**
 * convert the date to fmt string
 * example:
 *   new Date(2016,1,2).format('yyyy-MM-dd')  will return '2016-01-02'
 * @param format the dateStr fmt
 * @returns {*}
 */
Date.prototype.format = function (format) {
  const o = {
    'M+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'h+': this.getHours(), // hour
    'm+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
    S: this.getMilliseconds(), // millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1,
        RegExp.$1.length === 1 ? o[k] :
          ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
};

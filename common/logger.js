/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * This module contains the winston logger configuration.
 *
 * @author      TSCCODER
 * @version     1.0
 */

const _ = require('lodash');
const Joi = require('joi');
const winston = require('winston');
const util = require('util');
const config = require('config');
const getParams = require('get-parameter-names');

const transports = [];
if (!config.DISABLE_LOGGING) {
  transports.push(new (winston.transports.Console)({ level: config.LOG_LEVEL }));
}
const logger = new (winston.Logger)({ transports });

/**
 * Log error details with signature
 * @param err the error
 * @param signature the signature
 */
logger.logFullError = function (err, signature) {           // eslint-disable-line
  if (!err) {
    return;
  }
  const args = Array.prototype.slice.call(arguments);
  args.shift();
  logger.error.apply(logger, args);           // eslint-disable-line
  logger.error(util.inspect(err));
  if (!err.logged) {
    logger.error(err.stack);
  }
  err.logged = true;
};

/**
 * Remove invalid properties from the object and hide long arrays
 * @param {Object} obj the object
 * @returns {Object} the new object with removed properties
 * @private
 */
function _sanitizeObject(obj) {
  try {
    return JSON.parse(JSON.stringify(obj, (name, value) => {
      // Array of field names that should not be logged
      // add field if necessary (password, tokens etc)
      const removeFields = ['secretAccessKey', 'sessionToken', 'password'];
      if (_.includes(removeFields, name)) {
        return '<removed>';
      }
      if (_.isArray(value) && value.length > 30) {
        return 'Array(' + value.length + ')';
      }
      return value;
    }));
  } catch (e) {
    return obj;
  }
}

/**
 * Convert array with arguments to object
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
function _combineObject(params, arr) {
  const ret = {};
  _.each(arr, (arg, i) => {
    ret[params[i]] = arg;
  });
  return ret;
}

/**
 * Decorate all functions of a service and log debug information if DEBUG is enabled
 * @param {Object} service the service
 */
logger.decorateWithLogging = function (service) {
  if (config.LOG_LEVEL !== 'debug') {
    return;
  }
  _.each(service, (method, name) => {
    const params = method.params || getParams(method);
    service[name] = function* () {
      logger.debug('ENTER ' + name);
      logger.debug('input arguments');
      const args = Array.prototype.slice.call(arguments);
      logger.debug(util.inspect(_sanitizeObject(_combineObject(params, args))));
      try {
        const result = yield* method.apply(this, arguments);
        logger.debug('EXIT ' + name);
        logger.debug('output arguments');
        if (result !== null && result !== undefined) {
          logger.debug('output arguments');
          logger.debug(util.inspect(_sanitizeObject(result)));
        }
        return result;
      } catch (e) {
        logger.logFullError(e, name);
        throw e;
      }
    };
  });
};

/**
 * Decorate all functions of a service and validate input values
 * and replace input arguments with sanitized result form Joi
 * Service method must have a `schema` property with Joi schema
 * @param {Object} service the service
 */
logger.decorateWithValidators = function (service) {
  _.each(service, (method, name) => {
    if (!method.schema) {
      return;
    }
    const params = getParams(method);
    service[name] = function* () {
      const args = Array.prototype.slice.call(arguments);
      const value = _combineObject(params, args);
      const normalized = Joi.attempt(value, method.schema);

      const newArgs = [];
      // Joi will normalize values
      // for example string number '1' to 1
      // if schema type is number
      _.each(params, (param) => {
        newArgs.push(normalized[param]);
      });
      return yield method.apply(this, newArgs);
    };
    service[name].params = params;
  });
};

/**
 * Apply logger and validation decorators
 * @param {Object} service the service to wrap
 */
logger.buildService = function (service) {
  logger.decorateWithValidators(service);
  logger.decorateWithLogging(service);
};

module.exports = logger;

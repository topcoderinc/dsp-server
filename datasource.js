/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Init mongo datasource
 *
 * @author      TCSCODER
 * @version     1.0
 */

// The mongoose instance.
const _mongoose = require('mongoose');

// use bluebird promise library instead of mongoose default promise library
_mongoose.Promise = global.Promise;

// The database mapping.
const dbs = { };

/**
 * Gets a db connection for a URL.
 * @param     {String}    url         the url
 * @return    {object}                connection for the given URL
 */
function getDb(url, poolSize) {
  if (!dbs[url]) {
    const db = _mongoose.createConnection(url, {
      server: {
        poolSize: poolSize || 10,
      },
    });
    dbs[url] = db;
  }
  return dbs[url];
}

/**
 * Gets the mongoose.
 * @return    {Object}                the mongoose instance
 */
function getMongoose() {
  return _mongoose;
}

// exports the functions
module.exports = {
  getDb,
  getMongoose,
};

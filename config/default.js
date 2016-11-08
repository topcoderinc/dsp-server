/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * The default configuration file.
 *
 * @author      TCSCODER
 * @version     1.0
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3500,
  AUTH0_CLIENT_ID: 'wldYVvBOii71V8tBMhIyt1t2BThIoCHO',
  SALT_WORK_FACTOR: 2,
  TOKEN_EXPIRES: 10 * 60 * 60,
  db: {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/drones',
    poolSize: 5,
  },
};

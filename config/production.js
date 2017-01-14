/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * The default configuration file.
 *
 * @author      kbowerma
 * @version     1.1
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'nope',
  SALT_WORK_FACTOR: 2,
  TOKEN_EXPIRES: 10 * 60 * 60,
  db: {
    url: process.env.MONGOLAB_URI || 'mongodb://heroku_fx9hv53r:ar99t25g01qogb3m8qshhml82r@ds143588.mlab.com:43588/heroku_fx9hv53r',
    poolSize: 5,
  },
};

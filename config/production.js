/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * The production configuration file.
 *
 * @author      TCSCODER
 * @version     1.0
 */

module.exports = {
  PORT: process.env.port || 3000,
  db: {
    url: process.env.MONGOLAB_URI,
    poolSize: 10,
  },
};

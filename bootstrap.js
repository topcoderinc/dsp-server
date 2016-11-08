/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Init app
 *
 * @author      TCSCODER
 * @version     1.0
 */

global.Promise = require('bluebird');
const logger = require('./common/logger');

// build all services
logger.buildService(require('./services/DroneService'));
logger.buildService(require('./services/MissionService'));
logger.buildService(require('./services/UserService'));

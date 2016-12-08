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
logger.buildService(require('./services/CategoryService'));
logger.buildService(require('./services/ProviderService'));
logger.buildService(require('./services/PackageService'));
logger.buildService(require('./services/ReviewService'));
logger.buildService(require('./services/PackageRequestService'));
logger.buildService(require('./services/SavedPackageService'));
logger.buildService(require('./services/NotificationService'));
logger.buildService(require('./services/ServiceServices'));
logger.buildService(require('./services/DronePositionService'));

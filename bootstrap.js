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
const Joi = require('joi');
const logger = require('./common/logger');

// add joi types
Joi.objectId = () => Joi.string().regex(/^[a-f0-9]{24}$/);
Joi.offset = () => Joi.number().integer().min(0).default(0);
Joi.limit = () => Joi.number().integer().min(1).default(20);
Joi.point = () => Joi.array().length(2).items(Joi.number());
Joi.polygon = () => Joi.array().items(Joi.array().min(4).items(Joi.point())).min(1);
Joi.geoJSON = () => Joi.object({
  type: Joi.string().valid('Point', 'Polygon').required(),
  coordinates: Joi.alternatives()
    .when('type', {is: 'Point', then: Joi.point().required()})
    .when('type', {is: 'Polygon', then: Joi.polygon().required()}),
});

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
logger.buildService(require('./services/NoFlyZoneService'));

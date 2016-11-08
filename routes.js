/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Defines the API routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

const auth = require('./common/Auth.js');

module.exports = {
  '/api/v1/users/auth': {
    post: {
      controller: 'UserController',
      method: 'login',
    },
  },
  '/api/v1/users': {
    post: {
      controller: 'UserController',
      method: 'register',
    },
  },
  '/api/v1/drones': {
    post: {
      controller: 'DroneController',
      method: 'create',
    },
    get: {
      controller: 'DroneController',
      method: 'getAll',
    },
  },
  '/api/v1/drones/:id': {
    put: {
      controller: 'DroneController',
      method: 'update',
    },
  },
  '/api/v1/missions': {
    get: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'getAll',
    },
    post: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'create',
    },
  },
  '/api/v1/missions/:id': {
    get: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'getSingle',
    },
    put: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'update',
    },
    delete: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'deleteMission',
    },
  },
  '/api/v1/missions/:id/download': {
    get: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'download',
    },
  },
};

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
  '/login': {
    post: {
      controller: 'UserController',
      method: 'login',
    },
  },
  '/register': {
    post: {
      controller: 'UserController',
      method: 'register',
    },
  },
  '/login/social': {
    post: {
      controller: 'UserController',
      method: 'registerSocialUser',
    },
  },
  '/forgot-password': {
    post: {
      controller: 'UserController',
      method: 'forgotPassword',
    },
  },
  '/reset-password': {
    post: {
      controller: 'UserController',
      method: 'resetPassword',
    },
  },
  '/categories': {
    get: {
      controller: 'CategoryController',
      method: 'getAll',
    },
  },
  '/providers': {
    get: {
      controller: 'ProviderController',
      method: 'search',
    },
  },
  '/providers/:id': {
    get: {
      controller: 'ProviderController',
      method: 'getSingle',
    },
  },
  '/providers/:id/packages': {
    get: {
      controller: 'ProviderController',
      method: 'getPackages',
    },
  },
  '/providers/:id/missions': {
    get: {
      controller: 'ProviderController',
      method: 'getMissions',
    },
  },
  '/providers/:id/reviews': {
    get: {
      controller: 'ProviderController',
      method: 'getReviews',
    },
  },
  '/packages': {
    get: {
      controller: 'PackageController',
      method: 'search',
    },
  },
  '/packages/:id': {
    get: {
      controller: 'PackageController',
      method: 'getSingle',
    },
  },
  '/packages/:id/related': {
    get: {
      controller: 'PackageController',
      method: 'getRelated',
    },
  },
  '/packages/:id/request': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth()],
      method: 'create',
    },
  },
  '/requests': {
    get: {
      controller: 'PackageRequestController',
      middleware: [auth()],
      method: 'get',
    },
  },
  '/drones': {
    post: {
      controller: 'DroneController',
      method: 'create',
    },
    get: {
      controller: 'DroneController',
      method: 'getAll',
    },
  },
  '/drones/:id': {
    get: {
      controller: 'DroneController',
      method: 'getSingle',
    },
    put: {
      controller: 'DroneController',
      method: 'update',
    },
  },
  '/dronePosition/:id': {
    get: {
      controller: 'DronePositionController',
      method: 'getPositions',
    },
  },
  '/missions': {
    get: {
      controller: 'MissionController',
      method: 'search',
    },
  },
  '/missions/:id': {
    get: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'getSingle',
    },
  },
  '/missions/:id/review': {
    post: {
      controller: 'ReviewController',
      middleware: [auth()],
      method: 'create',
    },
  },
  '/saved-packages': {
    get: {
      controller: 'SavedPackageController',
      middleware: [auth()],
      method: 'get',
    },
  },
  '/saved-packages/:id': {
    post: {
      controller: 'SavedPackageController',
      middleware: [auth()],
      method: 'create',
    },
    delete: {
      controller: 'SavedPackageController',
      middleware: [auth()],
      method: 'remove',
    },
  },
  '/notifications': {
    get: {
      controller: 'NotificationController',
      middleware: [auth()],
      method: 'get',
    },
  },
  '/notifications/:id/read': {
    post: {
      controller: 'NotificationController',
      middleware: [auth()],
      method: 'read',
    },
  },
};

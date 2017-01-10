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
const providerRole = require('./common/Permission').providerRole;
const pilotRole = require('./common/Permission').pilotRole;

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
      middleware: [auth()],
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
  '/requests/:id': {
    get: {
      controller: 'PackageRequestController',
      middleware: [auth()],
      method: 'getSingle',
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
    post: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'create',
    },
  },
  '/missions/:id': {
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
      method: 'remove',
    },
  },
  '/missions/:id/download': {
    get: {
      controller: 'MissionController',
      middleware: [auth()],
      method: 'download',
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
  '/provider/dashboard': {
    get: {
      controller: 'ProviderController',
      middleware: [auth(), providerRole()],
      method: 'dashboard',
    },
  },
  '/provider/requests': {
    get: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'search',
    },
  },
  '/provider/requests/:id': {
    get: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'getSingleByProvider',
    },
  },
  '/provider/requests/:id/accept': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'accept',
    },
  },
  '/provider/requests/:id/reject': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'reject',
    },
  },
  '/provider/requests/:id/cancel': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'cancel',
    },
  },
  '/provider/requests/:id/complete': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'complete',
    },
  },

  '/provider/requests/:id/assign-drone': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'assignDrone',
    },
  },

  '/provider/requests/:id/mission-estimation': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'missionEstimation',
    },
  },
  '/provider/requests/:id/mission-telemetry': {
    post: {
      controller: 'PackageRequestController',
      middleware: [auth(), providerRole()],
      method: 'missionTelemetry',
    },
  },
  '/provider/drones/current-locations': {
    get: {
      controller: 'DroneController',
      middleware: [auth(), providerRole()],
      method: 'currentLocations',
    },
  },
  '/drones': {
    get: {
      controller: 'DroneController',
      method: 'getAll',
    },
    post: {
      controller: 'DroneController',
      method: 'createEmpty',
    },
  },
  '/drones/:id': {
    get: {
      controller: 'DroneController',
      method: 'getSingle',
    },
    put: {
      controller: 'DroneController',
      method: 'updateLocation',
    },
  },

  '/provider/drones': {
    get: {
      controller: 'DroneController',
      middleware: [auth(), providerRole()],
      method: 'getAllByProvider',
    },
    post: {
      controller: 'DroneController',
      middleware: [auth(), providerRole()],
      method: 'create',
    },
  },

  '/provider/drones/:id': {
    put: {
      controller: 'DroneController',
      middleware: [auth(), providerRole()],
      method: 'update',
    },
    get: {
      controller: 'DroneController',
      method: 'getSingle',
    },
    delete: {
      controller: 'DroneController',
      middleware: [auth(), providerRole()],
      method: 'deleteSingle',
    },
  },
  '/provider/drones/:droneId/missions/monthly-count': {
    get: {
      controller: 'MissionController',
      middleware: [auth(), providerRole()],
      method: 'monthlyCountByDrone',
    },

  },
  '/provider/drones/:droneId/missions': {
    get: {
      controller: 'MissionController',
      middleware: [auth(), providerRole()],
      method: 'getAllByDrone',
    },
  },
  '/provider/services': {
    get: {
      controller: 'ServiceController',
      middleware: [auth(), providerRole()],
      method: 'getAll',
    },
    post: {
      controller: 'ServiceController',
      middleware: [auth(), providerRole()],
      method: 'create',
    },
  },
  '/provider/services/:id': {
    put: {
      controller: 'ServiceController',
      middleware: [auth(), providerRole()],
      method: 'update',
    },
    get: {
      controller: 'ServiceController',
      middleware: [auth(), providerRole()],
      method: 'getSingle',
    },
    delete: {
      controller: 'ServiceController',
      middleware: [auth(), providerRole()],
      method: 'deleteSingle',
    },
  },
  '/nfz/search': {
    post: {
      controller: 'NoFlyController',
      method: 'search',
    },
  },
  '/nfz': {
    post: {
      controller: 'NoFlyController',
      method: 'create',
    },
  },
  '/nfz/:id': {
    put: {
      controller: 'NoFlyController',
      method: 'update',
    },
    delete: {
      controller: 'NoFlyController',
      method: 'remove',
    },
  },
  '/pilot/checklist/:id': {
    get: {
      controller: 'MissionController',
      middleware: [auth(), pilotRole()],
      method: 'getPilotChecklist',
    },
    put: {
      controller: 'MissionController',
      middleware: [auth(), pilotRole()],
      method: 'updatePilotChecklist',
    },
  },
  '/pilot/missions': {
    get: {
      controller: 'MissionController',
      middleware: [auth(), pilotRole()],
      method: 'fetchPilotMissions',
    },
  },
};

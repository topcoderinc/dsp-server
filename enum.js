/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';

/**
 * Contains app enums and constants
 */
const SocialType = {
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook',
};

const DroneStatus = {
  IN_MOTIONS: 'in-motions',
  IDLE_READY: 'idle-ready',
  IDLE_BUSY: 'idle-busy',
};

const Role = {
  CONSUMER: 'consumer',
  PROVIDER: 'provider',
  PILOT: 'pilot',
};

// todo: define proper statuses
const ProviderStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// todo: define needed accessories
const DroneAccessories = {
  CAMERA: 'camera',
};

const MissionStatus = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

const NotificationType = {
  MISSION_STARTED: 'mission-started',
  MISSION_COMPLETED: 'mission-completed',
};

const RequestStatus = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

module.exports = {
  SocialType,
  DroneStatus,
  Role,
  ProviderStatus,
  DroneAccessories,
  MissionStatus,
  NotificationType,
  RequestStatus,
};

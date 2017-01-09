/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';

/**
 * Contains app enums and constants
 */
const SocialType = {
  GOOGLE: 'google-oauth2',
  FACEBOOK: 'facebook',
};

const DroneStatus = {
  IN_MOTIONS: 'in-motion',
  IDLE_READY: 'idle-ready',
  IDLE_BUSY: 'idle-busy',
};

const Role = {
  CONSUMER: 'consumer',
  PROVIDER: 'provider',
  PILOT: 'pilot',
  ADMIN: 'admin',
};


const MissionStatus = {
  WAITING: 'waiting',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

const NotificationType = {
  MISSION_STARTED: 'mission-started',
  MISSION_COMPLETED: 'mission-completed',
  REQUEST_ACCEPTED: 'request-accepted', // to consumer, created by provider after accepting a request
  REQUEST_REJECTED: 'request-rejected', // to consumer, created by provider after rejecting a request
  REQUEST_CANCELLED: 'request-cancelled', // to consumer, created by provider after cancelling a scheduled request
};

const RequestStatus = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};


const ProviderStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};


const DroneAccessories = {
  CAMERA: 'camera',
};

// todo: define proper types
const DroneType = {
  type1: 'type1',
  type2: 'type2',
};

const PilotChecklistAnswers = {
  YES: 'yes',
  NO: 'no',
  NOTE: 'note',
};

module.exports = {
  SocialType,
  DroneStatus,
  Role,
  ProviderStatus,
  DroneAccessories,
  DroneType,

  MissionStatus,
  NotificationType,
  RequestStatus,
  PilotChecklistAnswers,
};

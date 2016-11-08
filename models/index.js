/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Init models
 *
 * @author      TSCCODER
 * @version     1.0
 */
const config = require('config');

const db = require('../datasource').getDb(config.db.url, config.db.poolSize);
// Drone model
const DroneSchema = require('./Drone').DroneSchema;

const Drone = db.model('Drone', DroneSchema);

// DronePosition model
const DronePositionSchema = require('./DronePosition').DronePositionSchema;

const DronePosition = db.model('DronePosition', DronePositionSchema);

// Mission model
const MissionSchema = require('./Mission').MissionSchema;

const Mission = db.model('Mission', MissionSchema);

// User model
const UserSchema = require('./User').UserSchema;

const User = db.model('User', UserSchema);

module.exports = {
  Drone,
  DronePosition,
  Mission,
  User,
};

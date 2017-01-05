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

// Drone position model
const DronePositionSchema = require('./DronePosition').DronePositionSchema;

const DronePosition = db.model('DronePosition', DronePositionSchema);

// Mission model
const MissionSchema = require('./Mission').MissionSchema;

const Mission = db.model('Mission', MissionSchema);

// User model
const UserSchema = require('./User').UserSchema;

const User = db.model('User', UserSchema);

// Category model
const CategorySchema = require('./Category').CategorySchema;

const Category = db.model('Category', CategorySchema);

// Provider model
const ProviderSchema = require('./Provider').ProviderSchema;

const Provider = db.model('Provider', ProviderSchema);

// Package model
const PackageSchema = require('./Package').PackageSchema;

const Package = db.model('Package', PackageSchema);

// Review model
const ReviewSchema = require('./Review').ReviewSchema;

const Review = db.model('Review', ReviewSchema);

// PackageRequest model
const PackageRequestSchema = require('./PackageRequest').PackageRequestSchema;

const PackageRequest = db.model('PackageRequest', PackageRequestSchema);

// SavedPackage model
const SavedPackageSchema = require('./SavedPackage').SavedPackageSchema;

const SavedPackage = db.model('SavedPackage', SavedPackageSchema);

// SavedPackage model
const NotificationSchema = require('./Notification').NotificationSchema;

const Notification = db.model('Notification', NotificationSchema);

// Service model

const ServiceSchema = require('./Service').ServiceSchema;

const Service = db.model('Service', ServiceSchema);


// Address
const AddressSchema = require('./Address').AddressSchema;

const Address = db.model('Address', AddressSchema);

// NoFlyZone
const NoFlyZoneSchema = require('./NoFlyZone').NoFlyZoneSchema;

const NoFlyZone = db.model('NoFlyZone', NoFlyZoneSchema);

// Question model
const QuestionSchema = require('./Question').QuestionSchema;

const Question = db.model('Question', QuestionSchema);

module.exports = {
  Drone,
  DronePosition,
  Mission,
  User,
  Category,
  Provider,
  Package,
  Review,
  PackageRequest,
  SavedPackage,
  Notification,
  Service,
  Address,
  NoFlyZone,
  Question,
};

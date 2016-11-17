/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Module to generate test data
 *
 * @author      TSCCODER
 * @version     1.0
 */

require('./bootstrap');
const config = require('config');
const _ = require('lodash');
const logger = require('./common/logger');
const helper = require('./common/helper');
const models = require('./models');

const Drone = models.Drone;
const User = models.User;
const Category = models.Category;
const Provider = models.Provider;
const Package = models.Package;
const Mission = models.Mission;
const Review = models.Review;
const PackageRequest = models.PackageRequest;
const Notification = models.Notification;

const drones = require('./data/drones.json');
const users = require('./data/users.json');
const categories = require('./data/categories.json');
const providers = require('./data/providers.json');
const packages = require('./data/packages.json');
const missions = require('./data/missions.json');
const reviews = require('./data/reviews.json');
const requests = require('./data/packageRequests.json');
const notifications = require('./data/notifications.json');

// players json data
const co = require('co');

co(function* () {
  logger.info('deleting previous data');
  yield Drone.remove({});
  yield User.remove({});
  yield Category.remove({});
  yield Provider.remove({});
  yield Package.remove({});
  yield Mission.remove({});
  yield Review.remove({});
  yield PackageRequest.remove({});
  yield Notification.remove({});
  logger.info(`creating ${drones.length} drones`);
  const droneDocs = yield Drone.create(drones);
    // encrypt password
  yield _.map(users, (u) => function* () {
    if (u.password) {
      u.password = yield helper.hashString(u.password, config.SALT_WORK_FACTOR);
    }
    return;
  });

  logger.info(`creating ${users.length} users`);
  const userDocs = yield User.create(users);

  logger.info(`creating ${categories.length} categories`);
  const categoryDocs = yield Category.create(categories);

  _.each(providers, (p, i) => {
    p.category = [categoryDocs[i % categoryDocs.length].id];
  });
  logger.info(`creating ${providers.length} providers`);
  const providerDocs = yield Provider.create(providers);

  _.each(packages, (p, i) => {
    p.provider = providerDocs[i % providerDocs.length].id;
  });
  logger.info(`creating ${packages.length} packages`);
  const packageDocs = yield Package.create(packages);

  _.each(missions, (m, i) => {
    m.package = packageDocs[i % packageDocs.length].id;
    m.provider = packageDocs[i % packageDocs.length].provider;
    m.pilot = userDocs[0].id; // setting all to first user for testing convinience
    m.drone = droneDocs[i % droneDocs.length].id;
  });
  logger.info(`creating ${missions.length} missions`);
  const missionDocs = yield Mission.create(missions);

  _.each(reviews, (r, i) => {
    r.user = userDocs[0].id; // setting all to first user for testing convinience
    r.mission = missionDocs[i % missionDocs.length].id;
    r.provider = missionDocs[i % missionDocs.length].provider;
  });
  logger.info(`creating ${reviews.length} reviews`);
  yield Review.create(reviews);

  _.each(requests, (r, i) => {
    r.user = userDocs[0].id; // setting all to first user for testing convinience
    r.package = packageDocs[i % packageDocs.length].id;
    r.provider = packageDocs[i % packageDocs.length].provider;
  });
  logger.info(`creating ${requests.length} requests`);
  yield PackageRequest.create(requests);

  _.each(notifications, (n) => {
    n.user = userDocs[0].id; // setting all to first user for testing convinience
  });
  logger.info(`creating ${notifications.length} notifications`);
  yield Notification.create(notifications);

  logger.info('data created successfully');
}).then(() => {
  logger.info('Done');
  process.exit();
}).catch((e) => {
  logger.error(e);
  process.exit();
});

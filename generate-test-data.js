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
const Service = models.Service;
const DronePosition = models.DronePosition;

const drones = require('./data/drones.json');
const users = require('./data/users.json');
const categories = require('./data/categories.json');
const providers = require('./data/providers.json');
const packages = require('./data/packages.json');
const missions = require('./data/missions.json');
const reviews = require('./data/reviews.json');
const requests = require('./data/packageRequests.json');
const notifications = require('./data/notifications.json');
const providerUsers = require('./data/provider-users.json');
const positions = require('./data/dronePositions.json');

const MissionStatus = require('./enum').MissionStatus;
const RequestStatus = require('./enum').RequestStatus;


for (let i = 0; i < requests.length; i++) {
  requests[i].whatToBeDelivered = 'things';
  requests[i].weight = Math.random() * 10;
  requests[i].payout = Math.random() * 10;
}

// players json data
const co = require('co');

co(function*() {
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
  yield DronePosition.remove({});
  
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

  yield _.map(providerUsers, (u) => function*() {
    if (u.password) {
      u.password = yield helper.hashString(u.password, config.SALT_WORK_FACTOR);
    }
  });
  _.each(providerUsers, (u, i) => {
    u.provider = providerDocs[i % providerDocs.length].id;
  });
  logger.info(`creating provider ${providerUsers.length} users`);
  const providerUserDocs = yield User.create(providerUsers);


  logger.info('creating 100 services');
  const serviceDcos = [];
  for (let i = 0; i < 100; i++) {
    serviceDcos.push(yield Service.create({
      name: 'service ' + i,
      pricing: i,
      description: 'hello ,i am service ' + i,
      provider: providerDocs[i % providerDocs.length].id,
    }));
  }

  _.each(packages, (p, i) => {
    p.provider = providerDocs[i % providerDocs.length].id;
    p.service = serviceDcos[i % serviceDcos.length].id;
    p.discount = 95;
    p.discountPrice = 95;
    p.insuranceClaim = Math.random() * 100;
    p.costPerMile = Math.random() * 10;
    _.each(p.location, (a) => {
      a.state = 'state';
    });
  });

  logger.info(`creating ${drones.length} drones`);
  const droneDocs = [];
  for (let i = 0; i < drones.length; i++) {
    drones[i].provider = providerDocs[i % providerDocs.length].id;
    drones[i].pilots = [providerUserDocs[i % providerUserDocs.length]];
    drones[i].serialNumber = 'serialNumber' + i;
    droneDocs.push(yield Drone.create(drones[i]));
  }

  logger.info(`creating ${packages.length} packages`);
  const packageDocs = yield Package.create(packages);

  _.each(missions, (m, i) => {
    m.package = packageDocs[i % packageDocs.length].id;
    m.provider = packageDocs[i % packageDocs.length].provider;
    m.pilot = userDocs[0].id; // setting all to first user for testing convinience
    m.drone = droneDocs[i % droneDocs.length].id;
    m.status = _.values(MissionStatus)[Math.floor(Math.random() * _.values(MissionStatus).length)];
    m.telemetry = {
      lat: 6,
      long: 7,
      speed: 15,
      distance: 12,
    };
    m.eta = 2;
    m.frontCameraUrl = 'http://google.com';
    m.backCameraUrl = 'http://google.com';
    m.gallery = [{
      thumbnailUrl: 'http://google.com',
      videoUrl: 'http://google.com',
      imageUrl: 'http://google.com',
    }];
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
  const requestDocs = yield PackageRequest.create(requests);

  for (let i = 0; i < requestDocs.length; i++) {
    requestDocs[i].mission = missionDocs[i % missionDocs.length].id;
    requestDocs[i].status = Math.random() > 0.5 ? RequestStatus.PENDING : RequestStatus.IN_PROGRESS;
    if (requestDocs[i].status === RequestStatus.IN_PROGRESS) {
      requestDocs[i].launchDate = new Date();
    }
    yield requestDocs[i].save();

    const mindex = i % missionDocs.length;
    missionDocs[mindex].provider = requestDocs[i].provider;
    missionDocs[mindex].status = Math.random() > 0.5 ? MissionStatus.IN_PROGRESS : MissionStatus.COMPLETED;
    missionDocs[mindex].pilot = providerUserDocs[i % providerDocs.length].id;
    if (missionDocs[mindex].status === MissionStatus.IN_PROGRESS) {
      missionDocs[mindex].startedAt = new Date();
      missionDocs[mindex].launchDate = new Date();
    } else if (missionDocs[mindex].status === MissionStatus.COMPLETED) {
      missionDocs[mindex].startedAt = new Date();
      missionDocs[mindex].launchDate = new Date();
      missionDocs[mindex].completedAt = new Date();
    }
    yield missionDocs[mindex].save();
  }
  _.each(notifications, (n) => {
    n.user = userDocs[0].id; // setting all to first user for testing convinience
  });
  logger.info(`creating ${notifications.length} notifications`);
  yield Notification.create(notifications);

  _.each(positions, (p) => {
    p.droneId = droneDocs[0].id;
  });
  logger.info(`creating ${positions.length} dronePositions`);
  yield DronePosition.create(positions);

  logger.info('data created successfully');
}).then(() => {
  logger.info('Done');
  process.exit();
}).catch((e) => {
  logger.error(e);
  process.exit();
});

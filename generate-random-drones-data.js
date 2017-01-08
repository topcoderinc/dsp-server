/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';

/**
 * Module to generate test data for specified number of drones, these drones are spread within an specific radius
 * from a seed point
 *
 * The data is for testing performance of getting nearest drones.
 *
 * @author      TSCCODER
 * @version     1.0
 */

const fs = require('fs');
const _ = require('lodash');

// Create random lat/long coordinates in a specified radius around a center point
function randomGeo(center, radius) {
  const y0 = center.latitude;
  const x0 = center.longitude;
  // about 111300 meters in one degree
  const rd = radius / 111300;

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newlat = y + y0;
  const newlon = x + x0;

  return {
    latitude: newlat,
    longitude: newlon,
  };
}

function generateDrones(centerPoint, radius, numDrones) {
  const drones = [];
  const statuses = ['in-motion', 'idle-busy', 'idle-ready'];

  for (let i = 0; i < numDrones; ++i) {
    const geoPoint = randomGeo(centerPoint, radius);

    drones.push({
      name: `drone${i}`,
      status: _.sample(statuses),
      accessories: {
        accessorie: {
          name: `drone${i} accessories`,
        },
      },
      system: `drone system ${i}`,
      maxFlightTime: 446.601675532741,
      maxBatteryTime: 910.0380475088598,
      currentLocation: [
        geoPoint.longitude,
        geoPoint.latitude,
      ],
      imageUrl: 'http://google.com/a.png',
      thumbnailUrl: 'http://google.com/a.png',
      type: 'type2',
      specificationContent: 'xx',
      specificationImageUrl: 'http://google.com/a.png',
      specificationPDFUrl: 'http://google.com/a.pdf',
      minSpeed: 114.53369095893886,
      maxSpeed: 936.3017933727192,
      maxCargoWeight: 1007.0783993523173,
      maxAltitude: 361.07582327403867,
      cameraResolution: 1002.0367312610831,
      videoResolution: 732.1252582827228,
      hasWiFi: false,
      hasBluetooth: true,
      engineType: 'engine',
      numberOfRotors: 1054.1744393566755,
      hasAccelerometer: false,
      hasGyroscope: true,
      hasRadar: false,
      hasGPS: true,
      hasObstacleSensors: true,
      hasUltraSonicAltimeter: false,
    });
  }
  return drones;
}

let numDrones;
if (process.argv.length !== 3) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} [numOfDrones]`); // eslint-disable-line no-console
  console.log('Set the default number to 10000'); // eslint-disable-line no-console
  numDrones = 10000;
} else {
  numDrones = parseInt(process.argv[2], 10);
}

// Center point
const centerPoint = {
  longitude: -77.03920125961304,
  latitude: 38.90709540316193,
};

// Radius, unit meter
const radius = 100000;

fs.writeFile('data/drones-within-area.json', JSON.stringify(generateDrones(centerPoint, radius, numDrones), null, 2), (err) => {
  if (err) {
    console.error('Failed to generate file'); // eslint-disable-line no-console
    process.exit(-1);
  }
});
console.log('Done'); // eslint-disable-line no-console

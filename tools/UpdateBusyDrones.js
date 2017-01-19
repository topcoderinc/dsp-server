/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Updates the drone status for in motion drones that haven't updated location for a while
 *
 * @author      TCSCODER
 * @version     1.0
 */

const DroneService = require('../services/DroneService');
const co = require('co');
// Exports
module.exports = {
  start,
};

const INTERVAL=60*1000;

/**
 * Create a drone in the system
 *
 * @param req the request
 * @param res the response
 */
function start() {
  setInterval(updateBusyDrones,INTERVAL);
}

function updateBusyDrones(){
  co(DroneService.updateBusyDrones()).catch(
    function(){console.log("error updating busy drones")}
  );
}
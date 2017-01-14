/**
 * Copyright (c) 2017 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's for AWS.
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const _ = require('lodash');
const config = require('config');
const errors = require('common-errors');
const AWS = require('aws-sdk-promise');
const {AWSAuthTypes} = require('../enum');
const Mission = require('../models').Mission;

const sts = new AWS.STS();

// Exports
module.exports = {
  getFederationToken,
};


/**
 * Get federation token
 *
 * Following AWSAuthTypes are supported:
 *
 * - MISSION:
 * Uploading an image to mission.
 * Additional values:
 * {String} missionId
 *
 * @param {String} userId the user id who performs this action
 * @param {Object} params the requests params, different types can contain different values
 * @param {String} params.type the request type
 * @returns {{region: String, credentials: Object, data: Object}} the temporary credentials and custom data
 */
function* getFederationToken(userId, params) {
  switch (params.type) {
    case AWSAuthTypes.MISSION: {
      const {missionId} = params;
      joi.assert({missionId}, {missionId: joi.objectId().required()});
      const mission = yield Mission.findOne({_id: missionId});
      if (!mission) {
        throw new errors.NotFoundError('mission not found or no permission');
      }
      const s3KeyPrefix = `missions/${missionId}/`;
      const {data: {Credentials}} = yield sts.getFederationToken({
        Name: userId,
        Policy: JSON.stringify({
          Id: 'Policy1',
          Version: '2012-10-17',
          Statement: [{
            Sid: 'Stm1',
            Effect: 'Allow',
            Action: [
              's3:DeleteObject',
              's3:PutObject',
            ],
            Resource: `arn:aws:s3:::${config.S3_BUCKET}/${s3KeyPrefix}*`,
          }, {
            Sid: 'Stm2',
            Effect: 'Allow',
            Action: [
              's3:ListBucket',
            ],
            Resource: `arn:aws:s3:::${config.S3_BUCKET}`,
            Condition: {
              StringLike: {'s3:prefix': s3KeyPrefix},
            },
          }],
        }),
      }).promise();
      return {
        region: config.AWS_REGION,
        credentials: {
          accessKeyId: Credentials.AccessKeyId,
          secretAccessKey: Credentials.SecretAccessKey,
          sessionToken: Credentials.SessionToken,
        },
        data: {
          s3Bucket: config.S3_BUCKET,
          s3KeyPrefix,
        },
      };
    }
    // no default
  }
}

getFederationToken.schema = {
  userId: joi.string().required(),
  params: joi.object().keys({
    type: joi.string().valid(_.values(AWSAuthTypes)).required(),
  }).unknown(),
};

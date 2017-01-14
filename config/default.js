/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * The default configuration file.
 *
 * @author      kbowerma
 * @version     1.1
 */

module.exports = {

  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3500,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'h7p6V93Shau3SSvqGrl6V4xrATlkrVGm',
  JWT_SECRET: process.env.JWT_SECRET || 'JWT_SECRET',
  SALT_WORK_FACTOR: 2,
  TOKEN_EXPIRES: 10 * 60 * 60,
  API_VERSION: 1,
  RESET_CODE_EXPIRES: 60 * 60,
  db: {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/dsp',
    poolSize: 5,
  },
  mail: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    FROM_EMAIL: process.env.EMAIL_FROM,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  },
  RESET_PASSWORD_SUBJECT: 'Reset your password',
  RESET_PASSWORD_TEMPLATE: 'You received this email because you send a reset password request to us, ' +
    'if you never registered, please ignore. ' +
    'To reset your password <a href=":link">click here</a><br><br> -- Dsp Server Team',
  // this is a frontend url, the user is redirected to this url from user's mailbox
  RESET_PASSWORD_LINK: 'http://localhost:3000/reset-password?token=:token',
};

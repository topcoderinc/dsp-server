/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Service for sending mail
 *
 * @author      TCSCODER
 * @version     1.0
 */

const nodemailer = require('nodemailer');
const logger = require('../common/logger');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'qq',
  port: 465,
  host: 'smtp.qq.com',
  secureConnection: true,
  auth: {
    user: 'cqy24@qq.com',
    pass: 'vafsjkvrnyakbjfh',
  },
});

function* sendMessage(mailTo, html, text) {
    // setup e-mail data with unicode symbols
  const mailOptions = {
    from: '"do not reply" <cqy24@qq.com>', // sender address
    to: mailTo, // list of receivers
    subject: 'Reset your password please', // Subject line
    text, // plaintext body
    html, // html body
  };

    // send mail with defined transport object
  yield transporter.sendMail(mailOptions).then((info) => {
    logger.info('Message sent: ' + info.response);
  });
}

module.exports = {
  sendMessage,
};

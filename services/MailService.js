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
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('config');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  port: config.mail.SMTP_PORT,
  host: config.mail.SMTP_HOST,
  auth: {
    user: config.mail.SMTP_USERNAME,
    pass: config.mail.SMTP_PASSWORD,
  },
});

function* sendMessage(mailTo, html, text, subject) {
    // setup e-mail data with unicode symbols
  const mailOptions = {
    from: config.mail.FROM_EMAIL, // sender address
    to: mailTo, // list of receivers
    subject, // Subject line
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

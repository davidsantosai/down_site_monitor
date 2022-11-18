/* This is the Worker File */

/* Dependencies */

const https = require("https");
const http = require("http");
const url = require("url");
const util = require("util");

const _data = require("../libs/data");
const { sendSMS } = require("../integrations/twilio");
const { append, compress, list, truncate } = require("../libs/logger");

const debug = util.debuglog("workers");

const workers = {};

/**
 * This function appends Alert data to the log files
 * @param {*} originalAlertData
 * @param {*} alertOutcome
 * @param {*} state
 * @param {*} alertWarrant
 * @param {*} timeOfAlert
 */
workers.log = function (
  originalAlertData,
  alertOutcome,
  state,
  alertWarrant,
  timeOfAlert
) {
  const logData = {
    alert: originalAlertData,
    outcome: alertOutcome,
    state,
    warning: alertWarrant,
    time: timeOfAlert,
  };

  const logDataString = JSON.stringify(logData);

  const logFileName = originalAlertData.id;
  append(logFileName, logDataString, (error) => {
    if (error) {
      debug("Failed to append log");
    } else {
      debug("Succesfully appended data");
    }
  });
};

/**
 * Sends a SMS to user based on web page status change
 * @param {*} newAlertData
 */
workers.alertUserStatusChange = function (newAlertData) {
  const message = `Alert: Your alert for Method ${newAlertData.method.toUpperCase()} for page ${
    newAlertData.protocol
  }://${newAlertData.url} has changed to ${newAlertData.state}`;

  sendSMS(newAlertData.userPhone, message, (error) => {
    if (error) {
      debug(`Error trying to send SMS to user ${newAlertData.userPhone}`);
    } else {
      debug("Succesfully sent SMS to user");
    }
  });
};

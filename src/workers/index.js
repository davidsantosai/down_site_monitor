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

/**
 * Obtain Alert Data and updates it if there have been any changes
 * @param {*} originalAlertData
 * @param {*} alertOutcome
 */
workers.processAlertOutcome = function (originalAlertData, alertOutcome) {
  const state =
    !alertOutcome.error &&
    alertOutcome.responseCode &&
    originalAlertData.successCodes.indexOf(alertOutcome.responseCode) > -1
      ? "up"
      : "down";

  const alertWarranted =
    originalAlertData.lastChecked && originalAlertData.state !== state
      ? true
      : false;

  const timeOfVerification = Date.now();

  workers.log(
    originalAlertData,
    alertOutcome,
    state,
    alertWarranted,
    timeOfVerification
  );

  const newAlertData = originalAlertData;

  newAlertData.state = state;
  newAlertData.lastChecked = timeOfVerification;

  _data.update("alerts", newAlertData.id, newAlertData, (error) => {
    if (error) {
      debug(`Unable to update data to alert with ID ${newAlertData.id}`);
    } else {
      if (!alertWarranted) {
        debug(
          `Alert Status hasn't changed for Alert ID ${newAlertData.id} no SMS sent`
        );
      } else {
        workers.alertUserStatusChange(newAlertData);
      }
    }
  });
};

/**
 * Process the alert by using the Data contained in the original Alert
 * @param {*} originalAlertData
 */
workers.performAlert = function (originalAlertData) {
  const alertOutcome = {
    error: false,
    responseCode: false,
  };

  let outcomeSent = false;

  const parsedUrl = url.parse(
    `${originalAlertData.protocol}://${originalAlertData.url}`,
    true
  );

  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  const requestConfig = {
    protocol: `${originalAlertData.protocol}:`,
    hostname,
    method: originalAlertData.method.toUpperCase(),
    path,
    timeout: originalAlertData.timeoutSeconds * 1000,
  };

  const _moduleToUse = originalAlertData.protocol === "http" ? http : https;

  const request = _moduleToUse.request(requestConfig, (response) => {
    alertOutcome.responseCode = response.statusCode;
    if (!outcomeSent) {
      workers.processAlertOutcome(originalAlertData, alertOutcome);
      outcomeSent = true;
    }
  });

  request.on("error", (error) => {
    alertOutcome.error = { error: true, value: error };
    if (!outcomeSent) {
      workers.processAlertOutcome(originalAlertData, alertOutcome);
      outcomeSent = true;
    }
  });

  request.on("timeout", (error) => {
    alertOutcome.error = { error: true, value: "timeout" };
    if (!outcomeSent) {
      workers.processAlertOutcome(originalAlertData, alertOutcome);
      outcomeSent = true;
    }
  });

  request.end();
};

/**
 * Validates the information contained in the Alert Data
 * @param {*} originalAlertData
 */
workers.validateAlertData = function (originalAlertData) {
  originalAlertData =
    originalAlertData && typeof originalAlertData === "object"
      ? originalAlertData
      : {};

  originalAlertData.id =
    originalAlertData.id &&
    typeof originalAlertData.id === "string" &&
    originalAlertData.id.trim().length === 21
      ? originalAlertData.id.trim()
      : false;

  originalAlertData.userPhone =
    originalAlertData.userPhone &&
    typeof originalAlertData.userPhone === "string" &&
    originalAlertData.userPhone.trim().length === 10
      ? originalAlertData.userPhone.trim()
      : false;

  originalAlertData.protocol =
    originalAlertData.protocol &&
    typeof originalAlertData.protocol === "string" &&
    ["http", "https"].includes(originalAlertData.protocol)
      ? originalAlertData.protocol
      : false;

  originalAlertData.url =
    originalAlertData.url && typeof originalAlertData.url === "string"
      ? originalAlertData.url
      : false;

  originalAlertData.method =
    originalAlertData.method &&
    typeof originalAlertData.method === "string" &&
    ["post", "get", "put", "delete"].includes(originalAlertData.method)
      ? originalAlertData.method
      : false;

  originalAlertData.successCodes =
    originalAlertData.successCodes &&
    typeof originalAlertData.successCodes === "object" &&
    originalAlertData.successCodes instanceof Array &&
    originalAlertData.successCodes.length
      ? originalAlertData.successCodes
      : false;

  originalAlertData.timeoutSeconds =
    typeof originalAlertData.timeoutSeconds === "number" &&
    originalAlertData.timeoutSeconds % 1 === 0 &&
    originalAlertData.timeoutSeconds > 3 &&
    originalAlertData.timeoutSeconds <= 8
      ? originalAlertData.timeoutSeconds
      : false;

  const validationFields = Object.keys(originalAlertData).some(
    (key) => originalAlertData[key] === false
  );

  originalAlertData.state =
    originalAlertData.state &&
    typeof originalAlertData.state === "string" &&
    ["up", "down"].includes(originalAlertData.state)
      ? originalAlertData.state
      : "down";

  originalAlertData.lastChecked =
    originalAlertData.lastChecked &&
    typeof originalAlertData.lastChecked === "number" &&
    originalAlertData.lastChecked > 0
      ? originalAlertData.lastChecked
      : false;

  if (validationFields) {
    debug(`Missing required fields for alert with ID ${originalAlertData.id}`);
  } else {
    workers.performAlert(originalAlertData);
  }
};

/**
 * Gather all existing alerts in the system, validates and executes them
 */
workers.gatherAllAlerts = function () {
  _data.list("alerts", (error, alerts) => {
    if (error || !alerts) {
      debug("No alerts found for processing");
    } else {
      alerts.forEach((alert) => {
        _data.read("alerts", alert, (error, originalAlertData) => {
          if (error || !originalAlertData) {
            debug(`Error trying to read alert with ID ${alert}`);
          } else {
            workers.validateAlertData(originalAlertData);
          }
        });
      });
    }
  });
};

/**
 * Rotates all logs related to alerts (Compress)
 */
workers.rotateLogs = function () {
  list(false, (error, logs) => {
    if (error || !logs) {
      debug("Could not find logs to Rotate");
    } else {
      logs.forEach((log) => {
        const logId = log.replace(".log", "");
        const newLogId = `${logId}-${Date.now()}`;

        compress(logId, newLogId, (error) => {
          if (error) {
            debug(`Could not compress log with ID ${logId}`);
          } else {
            truncate(logId, (error) => {
              if (error) {
                debug(`Error trying to truncate log with ID ${logId}`);
              } else {
                debug("Success");
              }
            });
          }
        });
      });
    }
  });
};

/* TIMERS */

/**
 * Excecutes every n seconds in a loop to Rotate Logs (compress)
 */
workers.logRotationLoop = function () {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

/**
 * Excecutes internally every minute to check existing alerts
 */
workers.alertLoop = function () {
  setInterval(() => {
    workers.gatherAllAlerts();
  }, 1000 * 60);
};

/* INIT */

/**
 * Trigger loops to initialize Workers
 */
workers.init = function () {
  console.log("\x1b[33m%s\x1b[0m", "Background workers are running");

  /* Get all alerts immediately the server runs */
  workers.gatherAllAlerts();

  /* Initialize Alert Loop */
  workers.alertLoop();

  /* Rotate Logs (compress) immediately the server runs */
  workers.rotateLogs();

  /* Initialize Log Rotation Loop (Compress) */
  workers.logRotationLoop();
};

module.exports = workers;

const _data = require("../libs/data");
const { verifyToken, createRandomString } = require("../libs/helpers");
const config = require("../configs");

module.exports = {
  get: function (data, callback) {
    /**
     * Alert - get
     * Required data: id
     * Optional data: none
     */

    const id =
      data.queryStringObject.id &&
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length === 21
        ? data.queryStringObject.id.trim()
        : false;

    if (!id) {
      callback(400, { status: 400, error: "Missing field" });
    } else {
      _data.read("alerts", id, (error, alertData) => {
        if (error || !alertData) {
          callback(404, { status: 404, error: "Resource not found" });
        } else {
          const token =
            data.headers.token && typeof data.headers.token === "string"
              ? data.headers.token
              : false;
          if (!token) {
            callback(403, { status: 403, error: "Forbidden" });
          } else {
            verifyToken(token, alertData.userPhone, (valid) => {
              if (!valid) {
                callback(403, { status: 403, error: "Forbidden" });
              } else {
                callback(200, { status: 200, data: alertData });
              }
            });
          }
        }
      });
    }
  },
  post: function (data, callback) {
    /**
     * Alert - post
     * Required data: protocol,url,method,successCodes,timeoutSeconds
     * Optional data: none
     */

    const fieldValidations = [];

    const protocol =
      data.payload.protocol &&
      typeof data.payload.protocol === "string" &&
      ["http", "https"].includes(data.payload.protocol)
        ? data.payload.protocol
        : false;

    fieldValidations.push(protocol);

    const url =
      data.payload.url &&
      typeof data.payload.url === "string" &&
      data.payload.url.trim().length > 0
        ? data.payload.url
        : false;

    fieldValidations.push(url);

    const method =
      data.payload.method &&
      typeof data.payload.method === "string" &&
      ["get", "post", "put", "delete"].includes(data.payload.method)
        ? data.payload.method
        : false;

    fieldValidations.push(method);

    const successCodes =
      data.payload.successCodes &&
      typeof data.payload.successCodes === "object" &&
      data.payload.successCodes instanceof Array &&
      data.payload.successCodes.length
        ? data.payload.successCodes
        : false;

    fieldValidations.push(successCodes);

    const timeoutSeconds =
      data.payload.timeoutSeconds &&
      typeof data.payload.timeoutSeconds === "number" &&
      data.payload.timeoutSeconds % 1 === 0 &&
      data.payload.timeoutSeconds > 3 &&
      data.payload.timeoutSeconds < 8
        ? data.payload.timeoutSeconds
        : false;

    fieldValidations.push(timeoutSeconds);

    if (fieldValidations.some((value) => value === false)) {
      callback(400, { status: 400, error: "Missing required fields" });
    } else {
      const token =
        data.headers.token && typeof data.headers.token === "string"
          ? data.headers.token
          : false;

      if (!token) {
        callback(403, { status: 403, error: "Forbidden" });
      } else {
        _data.read("tokens", token, (error, tokenData) => {
          if (error || !tokenData) {
            callback(403, { status: 403, error: "Forbidden" });
          } else {
            verifyToken(token, tokenData.phone, (valid) => {
              if (!valid) {
                callback(403, { status: 403, error: "Forbidden" });
              } else {
                const userPhone = tokenData.phone;
                _data.read("users", userPhone, (error, userData) => {
                  if (error || !userData) {
                    callback(403, { status: 403, error: "Forbidden" });
                  } else {
                    const userAlerts =
                      userData.alerts &&
                      typeof userData.alerts === "object" &&
                      userData.alerts instanceof Array
                        ? userData.alerts
                        : [];

                    if (userAlerts.length >= config.maxAlertsNumber) {
                      callback(400, {
                        status: 400,
                        error: "Maximum number of alerts reached",
                      });
                    } else {
                      const alertId = createRandomString(20);

                      const alertObject = {
                        id: alertId,
                        userPhone,
                        protocol,
                        url,
                        method,
                        successCodes,
                        timeoutSeconds,
                      };

                      _data.create("alerts", alertId, alertObject, (error) => {
                        if (error) {
                          callback(500, { status: 500, error: "Server Error" });
                        } else {
                          userData.alerts = userAlerts;
                          userData.alerts.push(alertId);
                          _data.update(
                            "users",
                            userPhone,
                            userData,
                            (error) => {
                              if (error) {
                                callback(500, {
                                  status: 500,
                                  error: "Server Error",
                                });
                              } else {
                                callback(200, {
                                  status: 200,
                                  data: alertObject,
                                });
                              }
                            }
                          );
                        }
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  },

  delete: function (data, callback) {
    /**
     * Alert - delete
     * Required data: id
     * Optional data: none
     */
    const id =
      data.queryStringObject.id &&
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length === 21
        ? data.queryStringObject.id.trim()
        : false;

    if (!id) {
      callback(400, { status: 400, error: "Missing required field" });
    } else {
      _data.read("alerts", id, (error, alertData) => {
        if (error || !alertData) {
          callback(404, { status: 404, error: "Alert not found" });
        } else {
          const token =
            typeof data.headers.token === "string" ? data.headers.token : false;

          if (!token) {
            callback(403, { status: 403, error: "Forbidden" });
          } else {
            verifyToken(token, alertData.userPhone, (valid) => {
              if (!valid) {
                callback(403, { status: 403, error: "Forbidden" });
              } else {
                /*TO DO: Delete the Alert in alerts folder + Delete the alert in the user and update it*/
                _data.delete("alerts", id, (error) => {
                  if (error) {
                    callback(500, { status: 500, error: "Server Error" });
                  } else {
                    _data.read(
                      "users",
                      alertData.userPhone,
                      (error, userData) => {
                        if (error || !userData) {
                          callback(500, { status: 500, error: "Server Error" });
                        } else {
                          const userAlerts =
                            userData.alerts &&
                            typeof userData.alerts === "object" &&
                            userData.alerts instanceof Array
                              ? userData.alerts
                              : [];

                          const alertPosition = userAlerts.indexOf(id);

                          if (alertPosition < 0) {
                            callback(500, {
                              status: 500,
                              error: "Server Error",
                            });
                          } else {
                            userAlerts.splice(alertPosition, 1);
                            userData.alerts = userAlerts;
                            _data.update(
                              "users",
                              alertData.userPhone,
                              userData,
                              (error) => {
                                if (error) {
                                  callback(500, {
                                    status: 500,
                                    error: "Server Error",
                                  });
                                } else {
                                  callback(200, { status: 200, data: "OK" });
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                });
              }
            });
          }
        }
      });
    }
  },
  put: function (data, callback) {
    /**
     * Alert - put
     * Required data: id
     * Optional data: protocol,url,method,successCodes or timeoutSeconds
     */

    const id =
      data.payload.id &&
      typeof data.payload.id === "string" &&
      data.payload.id.trim().length === 21
        ? data.payload.id
        : false;

    const updateAlert = {};

    data.payload.protocol &&
    typeof data.payload.protocol === "string" &&
    ["http", "https"].includes(data.payload.protocol)
      ? (updateAlert.protocol = data.payload.protocol)
      : false;

    data.payload.url &&
    typeof data.payload.url === "string" &&
    data.payload.url.trim().length > 0
      ? (updateAlert.url = data.payload.url.trim())
      : false;

    data.payload.method &&
    typeof data.payload.method === "string" &&
    ["get", "post", "put", "delete"].includes(data.payload.method)
      ? (updateAlert.method = data.payload.method)
      : false;

    data.payload.successCodes &&
    typeof data.payload.successCodes === "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length
      ? (updateAlert.successCodes = data.payload.successCodes)
      : false;

    data.payload.timeoutSeconds &&
    typeof data.payload.timeoutSeconds === "number" &&
    data.payload.timeoutSeconds % 1 &&
    data.payload.timeoutSeconds > 3 &&
    data.payload.timeoutSeconds < 8
      ? (updateAlert.timeoutSeconds = data.payload.timeoutSeconds)
      : false;

    if (!id) {
      callback(400, { status: 400, error: "Missing valid id" });
    } else {
      _data.read("alerts", id, (error, alertData) => {
        if (error || !alertData) {
          callback(500, { status: 500, error: "Server Error" });
        } else {
          const token =
            typeof data.headers.token === "string" ? data.headers.token : false;
          if (!token) {
            callback(403, { status: 403, error: "Forbidden" });
          } else {
            verifyToken(token, alertData.userPhone, (valid) => {
              if (!valid) {
                callback(403, { status: 403, error: "Forbidden" });
              }
            });
          }
        }
      });
    }
  },
};

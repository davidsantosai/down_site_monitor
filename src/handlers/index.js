const userHandlers = require("./users");
const tokenHandlers = require("./tokens");
const alertsHandlers = require("./alerts");

module.exports = {
  health: function (data, callback) {
    callback(200, { status: 200, data: "Server OK" });
  },
  notFound: function (data, callback) {
    callback(404, { status: 404, data: "Resource not Found" });
  },
  users: function (data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (!acceptableMethods.includes(data.method)) {
      callback(405, { status: 405, data: "Not allowed" });
    } else {
      /* Implement methods and call to user handler */
      userHandlers[data.method](data, callback);
    }
  },
  tokens: function (data, callback) {
    const acceptableMethods = ["get", "post"];
    if (!acceptableMethods.includes(data.method)) {
      callback(405, { status: 405, data: "Not allowed" });
    } else {
      tokenHandlers[data.method](data, callback);
    }
  },
  alerts: function (data, callback) {
    const acceptableMethods = ["get", "post", "put", "delete"];
    if (!acceptableMethods.includes(data.method)) {
      callback(405, { status: 405, data: "Not allowed" });
    } else {
      alertsHandlers[data.method](data, callback);
    }
  },
};

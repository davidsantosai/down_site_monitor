/**
 * PACKAGE REQUIREMENT
 */

const server = require("./server");
const workers = require("./workers");

/**
 * APP INITIALIZATION
 */

const app = {
  init: function () {
    /* start server */
    server.init();
    workers.init();
  },
};

app.init();

module.exports = app;

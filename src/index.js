/**
 * PACKAGE REQUIREMENT
 */

const server = require("./server");

/**
 * APP INITIALIZATION
 */

const app = {
  init: function () {
    /* start server */
    server.init();
  },
};

app.init();

module.exports = app;

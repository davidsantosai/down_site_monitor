/**
 * PACKAGE REQUIREMENT
 */

const http = require("http");
const path = require("path");
const url = require("url");
const config = require("./configs");
const stringDecoder = require("string_decoder").StringDecoder;
const { parseJSONToObject } = require("./libs/helpers");
const router = require("./routes");
const handlers = require("./handlers");
const util = require("util");
const debug = util.debuglog("server");

/**
 * SERVER INITIALIZATION
 */

const server = {};

server.serverConfiguration = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;

  const decoder = new stringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();
    /* Obtain handler to manipulate request */
    const requestHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    /* Build payload data (in JSON) to use with Handler */
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: parseJSONToObject(buffer),
    };

    /* Invoque obtained request handler with the payload */
    requestHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payload = typeof payload === "object" ? payload : {};
      const payloadString = JSON.stringify(payload);

      res.setHeader("Content-type", "application/json");
      res.writeHead(statusCode);

      if (statusCode >= 400) {
        debug(
          "\x1b[31m%s\x1b[0m",
          `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
        );
      } else {
        debug(
          "\x1b[32m%s\x1b[0m",
          `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
        );
      }

      res.end(payloadString);
    });
  });
};

server.httpServer = http.createServer((req, res) => {
  server.serverConfiguration(req, res);
});

server.init = function () {
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      "\x1b[31m%s\x1b[0m",
      `server is running on port ${config.httpPort}`
    );
  });
};

module.exports = server;

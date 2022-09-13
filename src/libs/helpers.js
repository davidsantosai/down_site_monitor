const crypto = require("crypto");
const config = require("../configs");

/**
 * Function to parse the current buffer string into a JSON object
 * @param {string} bufferString
 * @returns {object}
 */
const parseJSONToObject = function (bufferString) {
  try {
    return JSON.parse(bufferString);
  } catch (error) {
    return {};
  }
};

/**
 * Function that receives an string to create an encrypted password based on sha-256
 * @param {string} string
 * @returns {string}
 */
const hash = function (string) {
  if (typeof string !== "string" || !string.length) {
    return false;
  } else {
    const hashedValue = crypto
      .createHmac("sha256", config.secret)
      .update(string)
      .digest("hex");
    return hashedValue;
  }
};

module.exports = { parseJSONToObject, hash };

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

/**
 * Create random string to use as token
 * @param {number} strLength
 * @returns {string | boolean}
 */
const createRandomString = function (strLength) {
  strLength =
    typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (!strLength) {
    return false;
  } else {
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz";
    let token = "";
    for (let i = 0; i <= strLength; i++) {
      const randomValue = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      token += randomValue;
    }

    return token;
  }
};

/**
 *  Verifies if token is still valid (not expired) + Verifies if phone matches token
 *  @param {string} tokenId
 *  @param {string} phone
 *  @param {Function} callback
 *  @return {boolean}
 */
const verifyToken = function (tokenId, phone, callback) {
  require("../libs/data").read("tokens", tokenId, (error, tokenData) => {
    if (error || !tokenData) {
      callback(false);
    } else {
      if (tokenData.phone !== phone || tokenData.expires < Date.now()) {
        callback(false);
      } else {
        callback(true);
      }
    }
  });
};

module.exports = { parseJSONToObject, hash, createRandomString, verifyToken };

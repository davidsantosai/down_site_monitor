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

module.exports = { parseJSONToObject };

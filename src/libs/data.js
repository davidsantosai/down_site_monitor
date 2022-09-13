/**
 * This lib will handle Update & Management of all data of entities
 */

const fs = require("fs");
const path = require("path");
const { parseJSONToObject } = require("./helpers");

const lib = {
  baseDir: path.join(__dirname, "/../.data"),
  create: function (dir, file, data, callback) {
    fs.open(
      `${lib.baseDir}/${dir}/${file}.json`,
      "wx",
      (error, fileDescriptor) => {
        if (error) {
          callback("File might already exist");
        } else {
          const stringData = JSON.stringify(data);
          fs.writeFile(fileDescriptor, stringData, (error) => {
            if (error) {
              callback("Error while writing file");
            } else {
              fs.close(fileDescriptor, (error) => {
                if (error) {
                  callback("Error closing the file");
                } else {
                  callback(false);
                }
              });
            }
          });
        }
      }
    );
  },
  read: function (dir, file, callback) {
    fs.readFile(
      `${lib.baseDir}/${dir}/${file}.json`,
      "utf-8",
      (error, data) => {
        if (error || !data) {
          callback(error, data);
        } else {
          const parsedData = parseJSONToObject(data);
          callback(false, parsedData);
        }
      }
    );
  },
  update: function () {},
  delete: function () {},
  list: function () {},
};

module.exports = { ...lib };

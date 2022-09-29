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
  update: function (dir, file, data, callback) {
    fs.open(
      `${lib.baseDir}/${dir}/${file}.json`,
      "r+",
      (error, fileDescriptor) => {
        if (error) {
          callback("Error trying to open file");
        } else {
          const stringData = JSON.stringify(data);
          fs.truncate(fileDescriptor, (error) => {
            if (error) {
              callback("Error truncating the file");
            } else {
              fs.writeFile(fileDescriptor, stringData, (error) => {
                if (error) {
                  callback("Error writing file");
                } else {
                  fs.close(fileDescriptor, (error) => {
                    if (error) {
                      callback("Error trying to close file");
                    } else {
                      callback(false);
                    }
                  });
                }
              });
            }
          });
        }
      }
    );
  },
  delete: function (dir, file, callback) {
    fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (error) => {
      if (error) {
        callback("Error trying to delete file");
      } else {
        callback(false);
      }
    });
  },
  list: function (dir, callback) {
    fs.readdir(`${lib.baseDir}/${dir}/`, (error, data) => {
      if (error || !data || !data.length) {
        callback("Error trying to acquire data");
      } else {
        const filesName = [];
        data.forEach((file) => filesName.push(file.replace(".json", "")));
        callback(false, filesName);
      }
    });
  },
};

module.exports = { ...lib };

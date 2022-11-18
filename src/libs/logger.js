/* This is the logger */

/* Depencies */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const logger = {};

logger.baseDir = path.join(__dirname, "../.logs/");

/**
 * Appends a string into a log file and if there is no previous log file it will create a new one
 * @param {*} fileName
 * @param {*} logString
 * @param {*} callback
 */
logger.append = function (fileName, logString, callback) {
  fs.open(`${logger.baseDir}${fileName}.log`, "a", (error, fileDescriptor) => {
    if (error || !fileDescriptor) {
      callback("Couldn't open file");
    } else {
      fs.appendFile(fileDescriptor, `${logString}\n`, (error) => {
        if (error) {
          callback("Unable to append log information");
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
};

/**
 * Allow us to create a list of all logs - Optional: Option to compress said logs
 * @param {*} includeCompressedLogs
 * @param {*} callback
 */
logger.list = function (includeCompressedLogs, callback) {
  fs.readdir(logger.baseDir, (error, data) => {
    if (error || !data) {
      callback(error, data);
    } else {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        if (fileName.indexOf(".log") > -1) {
          trimmedFileNames.push(fileName.replace(".log", ""));
        }
        if (fileName.indexOf(".gz.b64") > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace(".gz.b64", ""));
        }
      });
      callback(false, trimmedFileNames);
    }
  });
};

/**
 * Compress a .log file to a .gz.b64 file and addts it to the logs folder
 * @param {*} logFileId
 * @param {*} newLogFileId
 * @param {*} callback
 */
logger.compress = function (logFileId, newLogFileId, callback) {
  const sourceFile = `${logFileId}.log`;
  const destinationFile = `${newLogFileId}.gz.b64`;

  fs.readFile(
    `${logger.baseDir}${sourceFile}`,
    "utf8",
    (error, inputString) => {
      if (error || !inputString) {
        callback(error);
      } else {
        zlib.gzip(inputString, (error, buffer) => {
          if (error || !buffer) {
            callback(error);
          } else {
            fs.open(
              `${logger.baseDir}${destinationFile}`,
              "wx",
              (error, fileDescriptor) => {
                if (error || !fileDescriptor) {
                  callback(error);
                } else {
                  fs.writeFile(
                    fileDescriptor,
                    buffer.toString("base64"),
                    (error) => {
                      if (error) {
                        callback(error);
                      } else {
                        fs.close(fileDescriptor, (error) => {
                          if (error) {
                            callback(error);
                          } else {
                            callback(false);
                          }
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    }
  );
};

/**
 * Decompresses .gz.b64 file to string
 * @param {*} fileId
 * @param {*} callback
 */
logger.decompress = function (fileId, callback) {
  fs.readFile(
    `${logger.baseDir}${fileId}.gz.b64`,
    "utf8",
    (error, fileContent) => {
      if (error || !fileContent) {
        callback(error);
      } else {
        const inputBuffer = Buffer.from(fileContent, "base64");
        zlib.unzip(inputBuffer, (error, outputBuffer) => {
          if (error || !outputBuffer) {
            callback(error);
          } else {
            const result = outputBuffer.toString();
            callback(false, result);
          }
        });
      }
    }
  );
};

/**
 * Truncate file
 * @param {*} fileId
 * @param {*} callback
 */
logger.truncate = function (fileId, callback) {
  fs.truncate(`${logger.baseDir}${fileId}.log`, 0, (error) => {
    if (error) {
      callback(false);
    } else {
      callback(error);
    }
  });
};

module.exports = logger;

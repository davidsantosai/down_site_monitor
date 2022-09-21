const _data = require("../libs/data");
const { hash, createRandomString } = require("../libs/helpers");
const config = require("../configs");

module.exports = {
  post: function (data, callback) {
    /*
     * Token - post
     * Required data: phone, password
     * Optional data: none
     */
    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;

    const password =
      typeof data.payload.password === "string" &&
      data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;

    if (!phone || !password) {
      callback(400, { status: 400, error: "Missing required value" });
    } else {
      _data.read("users", phone, (error, userData) => {
        if (error || !userData) {
          callback(400, { status: 400, error: "Couldn't find user" });
        } else {
          const hashedIncomingPassword = hash(password);
          if (hashedIncomingPassword !== userData.hashPassword) {
            callback(401, { status: 401, error: "Unauthorized access" });
          } else {
            const tokenId = createRandomString(config.tokenLength);
            const expirationTime = Date.now() + 1000 * 60 * 60;
            const tokenObject = { phone, id: tokenId, expires: expirationTime };

            _data.create("tokens", tokenId, tokenObject, (error) => {
              if (error) {
                callback(500, { status: 500, error: "Server error" });
              } else {
                callback(200, { status: 200, data: tokenObject });
              }
            });
          }
        }
      });
    }
  },
  get: function (data, callback) {
    /*
     * Token - get
     * Required data: id
     * Optional data: none
     */

    const id =
      data.queryStringObject.id &&
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length === config.tokenLength
        ? data.queryStringObject.id.trim()
        : false;

    if (!id) {
      callback(400, { status: 400, error: "Missing required field" });
    } else {
      _data.read("tokens", id, (error, tokenData) => {
        if (error || !tokenData) {
          callback(404, { status: 404, error: "Data not found" });
        } else {
          callback(202, { status: 200, data: tokenData });
        }
      });
    }
  },
};

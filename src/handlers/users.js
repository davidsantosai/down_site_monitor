const _data = require("../libs/data");
const { hash } = require("../libs/helpers");

module.exports = {
  post: function (data, callback) {
    /**
     * User - post
     * Required data: firstName, lastName, phone, password, tosAgreement
     * Optional data: none
     */

    const fieldValidations = [];

    const firstName =
      typeof data.payload.firstName === "string" &&
      data.payload.firstName.trim().length > 0
        ? data.payload.firstName.trim()
        : false;
    fieldValidations.push(firstName);

    const lastName =
      typeof data.payload.lastName === "string" &&
      data.payload.lastName.trim().length > 0
        ? data.payload.lastName.trim()
        : false;
    fieldValidations.push(lastName);

    const phone =
      typeof data.payload.phone === "string" &&
      data.payload.phone.trim().length === 10
        ? data.payload.phone.trim()
        : false;
    fieldValidations.push(phone);

    const password =
      typeof data.payload.password === "string" &&
      data.payload.password.trim().length > 10
        ? data.payload.password.trim()
        : false;
    fieldValidations.push(password);

    const tosAgreement =
      typeof data.payload.tosAgreement === "boolean" &&
      data.payload.tosAgreement
        ? data.payload.tosAgreement
        : false;
    fieldValidations.push(tosAgreement);

    if (fieldValidations.some((field) => field === false)) {
      callback(422, { status: 422, error: "Missing required data" });
    } else {
      /** Validate if user exists, in case of error (missing user based on phone) create user */
      _data.read("users", phone, (error, data) => {
        if (error) {
          /**Hash Password and Create User */
          const hashedPassword = hash(password);
          if (!hashedPassword) {
            callback(500, { status: 500, error: "Invalid hashing process" });
          } else {
            const user = {
              firstName,
              lastName,
              phone,
              hashPassword: hashedPassword,
              tosAgreement,
            };

            _data.create("users", `${phone}`, user, (error) => {
              if (error) {
                console.log(error);
                callback(500, { status: 500, error: "Unable to create user" });
              } else {
                callback(200, { status: 200, data: user });
              }
            });
          }
        } else {
          callback(401, { status: 401, error: "Unauthorized user" });
        }
      });
    }
  },
};

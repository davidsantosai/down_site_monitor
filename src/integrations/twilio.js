const config = require("../configs");
const https = require("https");

module.exports = {
  sendSMS: function (phone, message, callback) {
    phone =
      typeof phone === "string" && phone.trim().length === 10
        ? phone.trim()
        : false;

    message =
      typeof message === "string" &&
      message.trim().length > 1 &&
      message.trim().length <= 1600
        ? message.trim()
        : false;

    if (!phone || !message) {
      callback("Error with phone and/or message");
    } else {
      const payload = {
        From: config.twilio.fromPhone,
        To: `+57${phone}`,
        Body: message,
      };

      const stringifyPayload = new URLSearchParams(payload).toString();

      const requestConfig = {
        protocol: "https:",
        hostname: "api.twilio.com",
        method: "POST",
        path: `/2010-04-01/Accounts/${config.twilio.accountSID}/Messages.json`,
        auth: `${config.twilio.accountSID}:${config.twilio.authToken}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringifyPayload),
        },
      };

      const request = https.request(requestConfig, (response) => {
        if (response.statusCode > 201) {
          callback("Error sending SMS");
        } else {
          callback(false);
        }
      });

      request.on("error", (error) => {
        callback(error);
      });

      request.write(stringifyPayload);

      request.end();
    }
  },
};

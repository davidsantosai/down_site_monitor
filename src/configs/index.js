const develop = {
  httpPort: 3000,
  envName: "develop",
  secret: "key2022",
  tokenLength: 20,
  twilio: {
    fromPhone: "4246780753",
    accountSID: "ACb00f56a643afef04cdd159402f090b34",
    authToken: "2d8700608924ab2508c684fc2c05e874",
  },
  maxAlertsNumber: 3,
};

const main = {
  httpPort: 4000,
  envName: "production",
  secret: "key2023",
  tokenLength: 20,
  twilio: {
    fromPhone: "4246780753",
    accountSID: "ACb00f56a643afef04cdd159402f090b34",
    authToken: "2d8700608924ab2508c684fc2c05e874",
  },
  maxAlertsNumber: 3,
};

const environments = {
  develop,
  production: main,
};

const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments["develop"];

module.exports = { ...environmentToExport };

const develop = {
  httpPort: 3000,
  envName: "develop",
  secret: "key2022",
  tokenLength: 20,
  twilio: {
    fromPhone: "xxxxxxx",
    accountSID: "ACb00f56a643afef04cdd159402f090b34",
    authToken: "1763bc527c2b0a62666ae88548cc6260",
  },
};

const main = {
  httpPort: 4000,
  envName: "production",
  secret: "key2023",
  tokenLength: 20,
  twilio: {
    fromPhone: "xxxxxxx",
    accountSID: "ACb00f56a643afef04cdd159402f090b34",
    authToken: "1763bc527c2b0a62666ae88548cc6260",
  },
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

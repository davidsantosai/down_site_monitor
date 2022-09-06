const develop = {
  httpPort: 3000,
  envName: "develop",
};

const main = {
  httpPort: 4000,
  envName: "production",
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

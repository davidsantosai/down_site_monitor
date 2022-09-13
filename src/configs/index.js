const develop = {
  httpPort: 3000,
  envName: "develop",
  secret: "key2022",
};

const main = {
  httpPort: 4000,
  envName: "production",
  secret: "key2023",
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

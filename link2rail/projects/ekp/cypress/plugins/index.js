const cypressTypeScriptPreprocessor = require("./cy-ts-preprocessor");

/**
 * @type {Cypress.PluginConfig}
 */
const { GetSession } = require("./auth");

module.exports = (on, config) => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);
  on("task", {
    getSession({ username, password }) {
      return GetSession(username, password);
    },
  });
};

const base = require("../.eslintrc");

module.exports = Object.assign({}, base, {
  env: {
    node: true,
    mocha: true
  },
  globals: {
    Promise: true
  }
});

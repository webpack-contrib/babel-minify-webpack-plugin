module.exports = {
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "script",
  },
  env: {
    node: true
  },
  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"]
  }
}

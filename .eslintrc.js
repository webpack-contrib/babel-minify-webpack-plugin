module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['@webpack-contrib/eslint-config-webpack'],
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'es5', arrowParens: 'always' },
    ],
    'consistent-return': 1,
    'no-param-reassign': 1,
    'no-underscore-dangle': 1,
    'no-multi-assign': 1,
    'import/no-extraneous-dependencies': 1,
  },
};

# babili-webpack-plugin

This is a [webpack plugin](https://webpack.github.io/docs/using-plugins.html) for Babili.

Babili - A babel based minifier - https://github.com/babel/babili

# NOTE:

This might NOT be the best way to use babili. You can also use it with babel-loader for webpack (include `babili` in list of presets) and should be faster than using this.

[![Build Status](https://travis-ci.org/boopathi/babili-webpack-plugin.svg?branch=master)](https://travis-ci.org/boopathi/babili-webpack-plugin) [![npm version](https://badge.fury.io/js/babili-webpack-plugin.svg)](https://badge.fury.io/js/babili-webpack-plugin)

## Install

```sh
npm install babili-webpack-plugin --save-dev
```

## Usage

```js
// webpack.config.js
const BabiliPlugin = require("babili-webpack-plugin");
module.exports = {
  entry: //...,
  output: //...,
  plugins: [
    new BabiliPlugin(options)
  ]
}
```

## Options

+ `test`: JS file extension regex. Default: `/\.js($|\?)/i`
+ `comments`: Preserve Comments. Default: `/@preserve|@license/`. falsy value to remove all comments. Accepts function, object with property test (regex), and values.
+ `sourceMap`: Default: uses [webpackConfig.devtool](https://webpack.github.io/docs/configuration.html#devtool). Set this to override that.

## LICENSE

MIT

https://boopathi.mit-license.org

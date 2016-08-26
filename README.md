# babili-webpack-plugin

This is a [webpack plugin](https://webpack.github.io/docs/using-plugins.html) for Babili.

Babili - A babel based minifier - https://github.com/babel/babili

[![Build Status](https://travis-ci.org/boopathi/babili-webpack-plugin.svg?branch=master)](https://travis-ci.org/boopathi/babili-webpack-plugin)

## Install

```sh
npm install babili-webpack-plugin --save-dev
```

## Usage

```js
// webpack.config.js
const BabiliPlugin = require("babili-webpack-plugin");
{
  plugins: [
    new BabiliPlugin()
  ]
}
```

## LICENSE

MIT

https://boopathi.mit-license.org

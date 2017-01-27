"use strict";

const babel = require("babel-core");
const babiliPreset = require("babel-preset-babili");
const {SourceMapSource, RawSource} = require("webpack-sources");

module.exports = class BabiliPlugin {
  constructor(babiliOpts = {}, options = {}) {
    this.babiliOpts = babiliOpts;
    this.options = options;
  }

  apply(compiler) {
    const {babiliOpts, options} = this;

    const jsregex = options.test || /\.js($|\?)/i;
    const commentsRegex = typeof options.comments === "undefined"
      ? /@preserve|@licen(s|c)e/
      : options.comments;

    const useSourceMap = typeof options.sourceMap === "undefined"
      ? !!compiler.options.devtool
      : options.sourceMap;

    const _babel = this.options.babel || babel;
    const _babili = this.options.babili || babiliPreset;

    compiler.plugin("compilation", function (compilation) {
      if (useSourceMap) {
        compilation.plugin("build-module", function (module) {
          module.useSourceMap = true;
        });
      }

      compilation.plugin("optimize-chunk-assets", function (chunks, callback) {
        const files = [];

        chunks.forEach(chunk => {
          chunk.files.forEach(file => files.push(file));
        });

        compilation.additionalChunkAssets.forEach(file => files.push(file));

        files
          .filter(file => jsregex.test(file))
          .forEach(file => {
            try {
              let asset = compilation.assets[file];

              if (asset.__babilified) {
                compilation.assets[file] = asset.__babilified;
                return;
              }

              let input, inputSourceMap;

              if (useSourceMap) {
                if (asset.sourceAndMap) {
                  let sourceAndMap = asset.sourceAndMap();
                  inputSourceMap = sourceAndMap.map;
                  input = sourceAndMap.source;
                } else {
                  inputSourceMap = asset.map();
                  input = asset.source();
                }
              } else {
                input = asset.source();
              }

              // do the transformation
              const result = _babel.transform(input, {
                presets: [[_babili, babiliOpts]],
                sourceMaps: useSourceMap,
                babelrc: false,
                inputSourceMap,
                shouldPrintComment(contents) {
                  return shouldPrintComment(contents, commentsRegex);
                }
              });

              asset.__babilified = compilation.assets[file] = (
                result.map
                ? new SourceMapSource(result.code, file, result.map, input, inputSourceMap)
                : new RawSource(result.code)
              );
            } catch (e) {
              compilation.errors.push(e);
            }
          });

        callback();
      });
    });
  }
};

function shouldPrintComment(contents, checker) {
  switch (typeof checker) {
  case "function": return checker(contents);
  case "object": return checker.test(contents);
  default: return !!checker;
  }
}

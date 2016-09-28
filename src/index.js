"use strict";

const babel = require("babel-core");
const babiliPreset = require("babel-preset-babili");
const {SourceMapSource, RawSource} = require("webpack-sources");

module.exports = class BabiliPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const options = this.options;
    const jsregex = options.test || /\.js($|\?)/i;
    const commentsRegex = typeof options.comments === "undefined"
      ? /@preserve|@license/
      : options.comments;

    const useSourceMap = typeof options.sourceMap === "undefined"
      ? !!compiler.options.devtool
      : options.sourceMap;

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
              const result = babel.transform(input, {
                presets: [babiliPreset],
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

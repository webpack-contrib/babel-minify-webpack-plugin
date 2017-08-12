import babel from 'babel-core';
import babiliPreset from 'babel-preset-babili';
import { SourceMapSource, RawSource } from 'webpack-sources';

export default class BabiliPlugin {
  constructor(babiliOpts = {}, options = {}) {
    this.babiliOpts = babiliOpts;
    this.options = options;
  }

  apply(compiler) {
    const { babiliOpts, options } = this;

    if (options.minify === false) {
      return;
    }

    const jsregex = options.test || /\.js($|\?)/i;
    const commentsRegex = typeof options.comments === 'undefined' ? /@preserve|@licen(s|c)e/ : options.comments;

    const useSourceMap = typeof options.sourceMap === 'undefined' ? !!compiler.options.devtool : options.sourceMap;

    const _babel = this.options.babel || babel;
    const _babili = this.options.babili || babiliPreset;
    const parserOpts = this.options.parserOpts || {};

    compiler.plugin('compilation', (compilation) => {
      if (useSourceMap) {
        compilation.plugin('build-module', (module) => {
          module.useSourceMap = true;
        });
      }

      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        const files = [];

        chunks.forEach((chunk) => {
          chunk.files.forEach(file => files.push(file));
        });

        compilation.additionalChunkAssets.forEach(file => files.push(file));

        files
          .filter(file => jsregex.test(file))
          .forEach((file) => {
            try {
              const asset = compilation.assets[file];

              if (asset.__babilified) {
                compilation.assets[file] = asset.__babilified;
                return;
              }

              let input;
              let inputSourceMap;

              if (useSourceMap) {
                if (asset.sourceAndMap) {
                  const sourceAndMap = asset.sourceAndMap();
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
                parserOpts,
                presets: [[_babili, babiliOpts]],
                sourceMaps: useSourceMap,
                babelrc: false,
                inputSourceMap,
                shouldPrintComment(contents) {
                  return shouldPrintComment(contents, commentsRegex);
                },
              });

              asset.__babilified = compilation.assets[file] =
                (result.map ? new SourceMapSource(result.code, file, result.map, input, inputSourceMap) : new RawSource(result.code));
            } catch (e) {
              compilation.errors.push(e);
            }
          });

        callback();
      });
    });
  }
}

function shouldPrintComment(contents, checker) {
  switch (typeof checker) {
    case 'function': return checker(contents);
    case 'object': return checker.test(contents);
    default: return !!checker;
  }
}

import babel from 'babel-core';
import minifyPreset from 'babel-preset-minify';
import { SourceMapSource, RawSource } from 'webpack-sources';

export default class BabelMinifyPlugin {
  constructor(minifyOpts = {}, options = {}) {
    this.minifyOpts = minifyOpts;
    this.options = options;
  }

  apply(compiler) {
    const { minifyOpts, options } = this;

    const jsregex = options.test || /\.js($|\?)/i;
    const commentsRegex = typeof options.comments === 'undefined' ? /@preserve|@licen(s|c)e/ : options.comments;

    const useSourceMap = typeof options.sourceMap === 'undefined' ? !!compiler.options.devtool : options.sourceMap;

    const _babel = this.options.babel || babel;
    const _minifyPreset = this.options.minifyPreset || minifyPreset;
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

        files.filter(file => jsregex.test(file)).forEach((file) => {
          try {
            const asset = compilation.assets[file];

            if (asset.__babelminified) {
              compilation.assets[file] = asset.__babelminified;
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
              presets: [[_minifyPreset, minifyOpts]],
              sourceMaps: useSourceMap,
              babelrc: false,
              inputSourceMap,
              shouldPrintComment(contents) {
                return shouldPrintComment(contents, commentsRegex);
              },
            });

            // not a ternary because prettier puts test and consequent on different lines
            // and webpack-defaults has a rule not to do the same :(
            if (result.map) {
              compilation.assets[file] = new SourceMapSource(result.code, file, result.map, input, inputSourceMap);
            } else {
              compilation.assets[file] = new RawSource(result.code);
            }

            asset.__babelminified = compilation.assets[file];
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
    case 'function':
      return checker(contents);
    case 'object':
      return checker.test(contents);
    default:
      return !!checker;
  }
}

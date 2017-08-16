import babel from 'babel-core';
import babelPresetMinify from 'babel-preset-minify';
import { SourceMapSource, RawSource } from 'webpack-sources';

// alias for undefined / void 0 :(
// because of these eslint rules in webpack-defaults
// 1. no-void
// 2. no-undefined
let undef;

function getDefault(actualValue, defaultValue) {
  return actualValue !== undef ? actualValue : defaultValue;
}

export default class BabelMinifyPlugin {
  constructor(minifierOpts = {}, pluginOpts = {}) {
    this.options = {
      parserOpts: pluginOpts.parserOpts || {},
      minifyPreset: pluginOpts.minifyPreset || babelPresetMinify,
      minifierOpts,
      babel: pluginOpts.babel || babel,
      comments: getDefault(pluginOpts.comments, /^\**!|@preserve|@license|@cc_on/),
      // compiler.options.devtool overrides options.sourceMap if NOT set
      // so we set it to undefined/void 0 as the default value
      sourceMap: getDefault(pluginOpts.sourceMap, undef),
      jsregex: pluginOpts.jsregex || /\.js($|\?)/i,
    };
  }

  apply(compiler) {
    const { options } = this;
    // if sourcemap is not set
    options.sourceMap = getDefault(options.sourceMap, !!compiler.options.devtool);

    compiler.plugin('compilation', (compilation) => {
      if (options.sourceMap) {
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

        files.filter(file => options.jsregex.test(file)).forEach((file) => {
          try {
            const asset = compilation.assets[file];

            if (asset.__babelminified) {
              compilation.assets[file] = asset.__babelminified;
              return;
            }

            let input;
            let inputSourceMap;

            if (options.sourceMap) {
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
            const result = options.babel.transform(input, {
              parserOpts: options.parserOpts,
              presets: [[options.minifyPreset, options.minifierOpts]],
              sourceMaps: options.sourceMap,
              babelrc: false,
              inputSourceMap,
              shouldPrintComment(contents) {
                return shouldPrintComment(contents, options.comments);
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

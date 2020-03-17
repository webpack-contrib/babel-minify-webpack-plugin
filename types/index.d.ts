import { BabylonOptions } from 'babel-core';
import { Plugin } from 'webpack';

declare module 'babel-minify-webpack-plugin' {
  export type BabelMinifyPluginOptionValue = boolean | { [k: string]: any };

  export interface BabelMinifyOptions {
    [k: string]: any;
    booleans?: BabelMinifyPluginOptionValue;
    builtIns?: BabelMinifyPluginOptionValue;
    consecutiveAdds?: BabelMinifyPluginOptionValue;
    deadcode?: BabelMinifyPluginOptionValue;
    evaluate?: BabelMinifyPluginOptionValue;
    flipComparisons?: BabelMinifyPluginOptionValue;
    guards?: BabelMinifyPluginOptionValue;
    infinity?: BabelMinifyPluginOptionValue;
    keepClassName?: BabelMinifyPluginOptionValue;
    keepFnName?: BabelMinifyPluginOptionValue;
    mangle?: BabelMinifyPluginOptionValue;
    memberExpressions?: BabelMinifyPluginOptionValue;
    mergeVars?: BabelMinifyPluginOptionValue;
    numericLiterals?: BabelMinifyPluginOptionValue;
    propertyLiterals?: BabelMinifyPluginOptionValue;
    regexpConstructors?: BabelMinifyPluginOptionValue;
    removeConsole?: BabelMinifyPluginOptionValue;
    removeDebugger?: BabelMinifyPluginOptionValue;
    removeUndefined?: BabelMinifyPluginOptionValue;
    replace?: BabelMinifyPluginOptionValue;
    simplify?: BabelMinifyPluginOptionValue;
    simplifyComparisons?: BabelMinifyPluginOptionValue;
    tdz?: BabelMinifyPluginOptionValue;
    typeConstructors?: BabelMinifyPluginOptionValue;
    undefinedToVoid?: BabelMinifyPluginOptionValue;
  }

  export interface BabelMinifyPluginOptions {
    test?: RegExp;
    include?: string[];
    exclude?: string[];
    comments?: (contents: string) => boolean | RegExp | boolean;
    sourceMap?: string;
    parserOpts?: BabylonOptions;
    babel?: any;
    minifyPreset?: any;
  }

  export default class BabelMinifyPlugin extends Plugin {
    constructor(
        minifyOpts?: BabelMinifyOptions,
        pluginOpts?: BabelMinifyPluginOptions
    );
  }
}

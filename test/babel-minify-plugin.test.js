/* eslint-disable no-undefined */
import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import rimraf from 'rimraf';
import { SourceMapConsumer } from 'source-map';
import { transform } from 'babel-core';
import BabelMinifyPlugin from '../src/index';

const buildDir = path.join(__dirname, 'build');

const preserveRegexp = /\/\*.*@preserve.*\*\//;
const licenseRegexp = /\/\*.*@license.*\*\//;
const hmmRegexp = /\/\*.*Hmm.*\*\//;

describe('babel-minify-webpack-plugin', () => {
  afterEach(() => {
    rimraf.sync(buildDir);
  });

  describe('works', () => {
    it('fine', async () => {
      await run();
      const output = getFile('bundle.js');
      expect(isMinified(output)).toBe(true);
    });
  });

  describe('sourcemaps', () => {
    beforeAll(async () => run({ devtool: 'sourcemap' }));

    it('should have sourcemaps with correct filenames', () => {
      const src = sources().map(s => s.replace('webpack:///', ''));
      expect(src).toContain('test/resources/app.js');
      expect(src).toContain('test/resources/a.js');
      expect(src).toContain('test/resources/b.js');
    });
  });

  describe('options', () => {
    afterEach(() => {
      rimraf.sync(buildDir);
    });

    it('should disable sourcemap when devtool is not present', async () => {
      await run({ devtool: undefined });
      expect(isExists(path.join(buildDir, 'bundle.js'))).toEqual(true);
      expect(isExists(path.join(buildDir, 'bundle.js.map'))).toEqual(false);
    });

    it('should accept a regex as comments test', async () => {
      await run({ comments: /@preserve/ });
      const output = getFile('bundle.js');
      expect(output).toMatch(preserveRegexp);
      expect(output).not.toMatch(licenseRegexp);
    });

    it('should accept function as comments test', async () => {
      await run({
        comments(comment) {
          return comment.includes('Hmm');
        },
      });

      const output = getFile('bundle.js');
      expect(output).not.toMatch(preserveRegexp);
      expect(output).not.toMatch(licenseRegexp);
      expect(output).toMatch(hmmRegexp);
    });

    it('should accept a custom babel', async () => {
      const mockOutput = '-🎉-THIS-IS-AN-INVALID-MOCK-CODE-🎉-';
      const mockTransform = jest.fn(() => {
        return { code: mockOutput };
      });
      await run({ babel: { transform: mockTransform } });
      const output = getFile('bundle.js');
      expect(output).toBe(mockOutput);
    });

    it('should accept a custom minifyPreset', async () => {
      const mockPlugin = jest.fn(() => {
        return { visitor: {} };
      });
      const mockPreset = jest.fn(() => {
        return {
          plugins: [mockPlugin],
        };
      });
      await run({ minifyPreset: mockPreset });
      expect(mockPreset.mock.calls.length).toBe(1);
      expect(mockPlugin.mock.calls.length).toBe(1);
    });
  });
});

function run(opts) {
  const compiler = webpack(getConfig(opts));
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

function sources() {
  const map = JSON.parse(getFile('bundle.js.map'));
  const smc = new SourceMapConsumer(map);
  return smc.sources;
}

function isExists(file) {
  try {
    fs.statSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

function getFile(file) {
  return fs.readFileSync(path.join(buildDir, file)).toString();
}

function getConfig(opts = {}) {
  return {
    entry: path.join(__dirname, 'resources/app.js'),
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'build'),
    },
    plugins: [new BabelMinifyPlugin({}, opts)],
    devtool: opts.devtool ? opts.devtool : undefined,
  };
}

function isMinified(code) {
  let minified = true;

  // traverse the code and find if there are any unmangled names
  // this acts as a cue to find if a code is minified
  transform(code, {
    plugins: [
      () => {
        return {
          visitor: {
            ReferencedIdentifier(path) {
              const { name } = path.node;
              if (name.length > 2 && ['undefined', 'arguments'].indexOf(name) < 0 && !path.scope.hasGlobal(name)) {
                minified = false;
                path.stop();
              }
            },
          },
        };
      },
    ],
  });

  return minified;
}

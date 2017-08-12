/* eslint-disable no-undefined */
import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import rimraf from 'rimraf';
import { SourceMapConsumer } from 'source-map';
import BabiliPlugin from '../src/index';

const buildDir = path.join(__dirname, 'build');

const preserveRegexp = /\/\*.*@preserve.*\*\//;
const licenseRegexp = /\/\*.*@license.*\*\//;
const hmmRegexp = /\/\*.*Hmm.*\*\//;

describe('babili-webpack-plugin', () => {
  afterEach(() => {
    rimraf.sync(buildDir);
  });

  describe('sourcemaps', () => {
    beforeAll((done) => {
      run({
        devtool: 'sourcemap',
      }).then(() => done()).catch(err => done(err));
    });

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

    it('should disable sourcemap when devtool is not present', (done) => {
      run({
        devtool: undefined,
      }).then(() => {
        expect(isExists(path.join(buildDir, 'bundle.js'))).toEqual(true);
        expect(isExists(path.join(buildDir, 'bundle.js.map'))).toEqual(false);
        done();
      }).catch(e => done(e));
    });

    it('should accept a regex as comments test', (done) => {
      run({
        comments: /@preserve/,
      }).then(() => {
        const output = getFile('bundle.js');
        expect(output).toMatch(preserveRegexp);
        expect(output).toNotMatch(licenseRegexp);
        done();
      }).catch(e => done(e));
    });

    it('should accept function as comments test', (done) => {
      run({
        comments(comment) {
          return comment.includes('Hmm');
        },
      }).then(() => {
        const output = getFile('bundle.js');
        expect(output).toNotMatch(preserveRegexp);
        expect(output).toNotMatch(licenseRegexp);
        expect(output).toMatch(hmmRegexp);
        done();
      }).catch(e => done(e));
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
  const map = JSON.parse(
    getFile('bundle.js.map'),
  );
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

function getConfig(opts) {
  if (typeof opts === 'undefined') opts = {};

  return {
    entry: path.join(__dirname, 'resources/app.js'),
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'build'),
    },
    plugins: [
      new BabiliPlugin({}, opts),
    ],
    devtool: opts.devtool ? opts.devtool : undefined,
  };
}

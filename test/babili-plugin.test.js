"use strict";

const path = require("path");
const fs = require("fs");
const expect = require("expect");
const webpack = require("webpack");
const rimraf = require("rimraf");
const { SourceMapConsumer } = require("source-map");

const BabiliPlugin = require("../src/index");
const buildDir = path.join(__dirname, "build");

const preserveRegexp = /\/\*.*@preserve.*\*\//;
const licenseRegexp = /\/\*.*@license.*\*\//;
const hmmRegexp = /\/\*.*Hmm.*\*\//;

describe("babili-webpack-plugin", function () {
  afterEach(function () {
    rimraf.sync(buildDir);
  });

  describe("sourcemaps", function () {
    beforeAll(function (done) {
      run({
        devtool: "sourcemap"
      }).then(() => done()).catch(err => done(err));
    });

    it("should have sourcemaps with correct filenames", function () {
      const src = sources().map(s => s.replace("webpack:///", ""));
      expect(src).toInclude("test/resources/a.js");
      expect(src).toInclude("test/resources/b.js");
      expect(src).toInclude("test/resources/app.js");
    });
  });

  describe("options", function () {
    afterEach(function () {
      rimraf.sync(buildDir);
    });

    it("should disable sourcemap when devtool is not present", function (done) {
      run({
        devtool: void 0
      }).then(() => {
        expect(isExists(path.join(buildDir, "bundle.js"))).toEqual(true);
        expect(isExists(path.join(buildDir, "bundle.js.map"))).toEqual(false);
        done();
      }).catch(e => done(e));
    });

    it("should accept a regex as comments test", function (done) {
      run({
        comments: /@preserve/
      }).then(() => {
        const output = getFile("bundle.js");
        expect(output).toMatch(preserveRegexp);
        expect(output).toNotMatch(licenseRegexp);
        done();
      }).catch(e => done(e));
    });

    it("should accept function as comments test", function (done) {
      run({
        comments(comment) {
          return comment.indexOf("Hmm") !== -1;
        }
      }).then(() => {
        const output = getFile("bundle.js");
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
    compiler.run(function (err, stats) {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

function sources() {
  const map = JSON.parse(
    getFile("bundle.js.map")
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
  if (typeof opts === "undefined") opts = {};

  return {
    entry: path.join(__dirname, "resources/app.js"),
    output: {
      filename: "bundle.js",
      path: path.join(__dirname, "build")
    },
    plugins: [
      new BabiliPlugin({}, opts)
    ],
    devtool: opts.devtool ? opts.devtool : void 0
  }
}

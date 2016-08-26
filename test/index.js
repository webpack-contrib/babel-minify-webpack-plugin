const path = require("path");
const fs = require("fs");
const expect = require("expect");
const webpack = require("webpack");
const {SourceMapConsumer} = require("source-map");

const BabiliPlugin = require("../");

const config = {
  entry: path.join(__dirname, "resources/app.js"),
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "build")
  },
  plugins: [
    new BabiliPlugin()
  ],
  devtool: "sourcemap"
}

describe("babili-webpack-plugin", function () {
  const result = run();

  it("should run and minify", function (done) {
    result
      .then(stats => done())
      .catch(err => done(err));
  });

  it("should have sourcemaps with correct filenames", function (done) {
    result
      .then(() => {
        const src = sources().map(s => s.replace("webpack:///", ""));
        expect(src).toInclude("test/resources/a.js");
        expect(src).toInclude("test/resources/b.js");
        expect(src).toInclude("test/resources/app.js");
        done();
      })
      .catch(err => done(err));
  });
});

function run() {
  const compiler = webpack(config);
  return new Promise((resolve, reject) => {
    compiler.run(function (err, stats) {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

function sources() {
  const map = JSON.parse(
    fs.readFileSync(path.join(__dirname, "build/bundle.js.map"))
  );
  const smc = new SourceMapConsumer(map);
  return smc.sources;
}

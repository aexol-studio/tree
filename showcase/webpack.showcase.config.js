var webpack = require("webpack");
var path = require("path");

var sourcePath = path.resolve(__dirname, "./");
var outPath = path.resolve(__dirname, "./");
const { CheckerPlugin } = require("awesome-typescript-loader");

module.exports = {
  context: sourcePath,
  entry: {
    app: "./index.tsx"
  },
  mode: "development",
  output: {
    path: outPath,
    filename: "bundle.js",
    publicPath: "/"
  },
  target: "web",
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
    mainFields: ["module", "browser", "main"],
    alias: {
      diagramSrc: path.resolve(__dirname, "../src")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { configFile: 'showcase/tsconfig.json' }
      },
      { test: /\.(png|svg)$/, use: 'url-loader?limit=10000' }
    ]
  },
  plugins: [new CheckerPlugin()]
};

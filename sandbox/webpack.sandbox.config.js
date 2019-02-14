var webpack = require("webpack");
var path = require("path");

var sourcePath = path.resolve(__dirname, "./");
var outPath = path.resolve(__dirname, "./");
const { CheckerPlugin } = require("awesome-typescript-loader");
/* var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin'); */

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
        loader: "awesome-typescript-loader"
      }
    ]
  },
  plugins: [new CheckerPlugin()]
};

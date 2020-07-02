/*global __dirname*/
/*global module*/

var path = require("path");

var sourcePath = path.resolve(__dirname, "../");
var outPath = path.resolve(__dirname, "../");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  context: sourcePath,
  entry: {
    app: "./sandbox/index.tsx",
  },
  mode: "development",
  output: {
    path: outPath,
    filename: "bundle.js",
    publicPath: "/",
  },
  target: "web",
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
    mainFields: ["module", "browser", "main"],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, "../tsconfig.json"),
      }),
    ],
  },
  devServer: {
    publicPath: "/",
    contentBase: "./showcase",
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",

          options: { configFile: "../tsconfig.sandbox.json" },
        },
      },
    ],
  },
};

/*global __dirname*/
/*global module*/

var path = require("path");

var sourcePath = path.resolve(__dirname, "./src");
var outPath = path.resolve(__dirname, "./lib");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  context: sourcePath,
  entry: {
    app: "./index.ts",
  },
  mode: "development",
  output: {
    path: outPath,
    filename: "index.js",
    publicPath: "/",
  },
  target: "web",
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
    mainFields: ["module", "browser", "main"],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.build.json"),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "./tsconfig.build.json"),
          },
        },
      },
    ],
  },
};

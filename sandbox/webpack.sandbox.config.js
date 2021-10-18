var path = require('path');
var sourcePath = path.join(__dirname, './');
var outPath = path.join(__dirname, './');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  context: sourcePath,
  entry: {
    app: './index.ts',
  },
  output: {
    path: outPath,
    filename: 'bundle.js',
    chunkFilename: '[chunkhash].js',
    publicPath: '/',
  },
  target: 'web',
  mode: 'development',
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['module', 'browser', 'main'],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: '/node_modules/',
        options: { configFile: 'sandbox/tsconfig.json' },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'assets/index.html',
    }),
  ],
};

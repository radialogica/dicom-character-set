const path = require('path');
const rootPath = process.cwd();
const context = path.join(rootPath, "src");
const outputPath = path.join(rootPath, 'dist');
const bannerPlugin = require(path.join(__dirname, 'plugins', 'banner.js'));
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  context: context,
  entry: {
    'dicom-character-set': './index.js'
  },
  target: 'web',
  output: {
    filename: '[name].js',
    library: {
      name: "dicom-character-set",
      type: 'umd'
    },
    globalObject: ('typeof self !== "undefined" ? self : this'), // i.e. https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js
    path: outputPath,
    umdNamedDefine: false
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader'
      }]
    }]
  },
  plugins: [
    bannerPlugin(),
    new ESLintPlugin()
  ]
};

const config = require('./webpack-base-no-polyfill');

config.module.rules.push({
  test: /\.js$/,
  exclude: /(node_modules)/,
  use: [{
    loader: 'babel-loader'
  }]
});

config.output.filename = '[name].js';

module.exports = config;
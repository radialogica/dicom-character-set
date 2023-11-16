const merge = require('./merge');
const baseConfig = require('./webpack-dev');
const TerserPlugin = require('terser-webpack-plugin');

const prodConfig = {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({extractComments: false})]
  },
};

baseConfig.output.filename = baseConfig.output.filename.replace('.js', '.min.js');

module.exports = merge(baseConfig, prodConfig);
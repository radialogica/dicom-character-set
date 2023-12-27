import merge from './merge.js';
import baseConfig from './webpack-dev.js';
import TerserPlugin from 'terser-webpack-plugin';

const prodConfig = {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({extractComments: false})]
  },
};

baseConfig.output.filename = baseConfig.output.filename.replace('.js', '.min.js');

export default merge(baseConfig, prodConfig);
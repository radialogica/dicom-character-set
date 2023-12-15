import path from 'path';
const rootPath = process.cwd();
const context = path.join(rootPath, "src");
const outputPath = path.join(rootPath, 'dist');
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const bannerPlugin = await import(path.join(__dirname, 'plugins', 'banner.js'));
import ESLintPlugin from 'eslint-webpack-plugin';

export default {
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
    bannerPlugin.default(),
    new ESLintPlugin()
  ]
};

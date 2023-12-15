import webpackConfig from '../webpack';
import puppeteer from 'puppeteer';

/* eslint no-process-env:0 */
process.env.CHROME_BIN = puppeteer.executablePath();

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running tests (var test/foo_test.js = ...)
delete webpackConfig.output.library;

// Code coverage
export default {
  basePath: '../../',
  frameworks: ['mocha'],
  reporters: ['progress', 'coverage'],
  files: [
    'src/**/*.js',
    'test/**/*-test.js'
  ],

  plugins: [
    'karma-webpack',
    'karma-mocha',
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-coverage'
  ],

  preprocessors: {
    'src/**/*.js': ['webpack', 'coverage'],
    'test/**/*-test.js': ['webpack']
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    noInfo: false,
    stats: {
      chunks: false,
      timings: false,
      errorDetails: true
    }
  },

  coverageReporter: {
    dir: './coverage',
    reporters: [
      {type: 'html', subdir: 'html'},
      {type: 'lcov', subdir: '.'},
      {type: 'text', subdir: '.', file: 'text.txt'},
      {type: 'text-summary', subdir: '.', file: 'text-summary.txt'}
    ]
  }
};
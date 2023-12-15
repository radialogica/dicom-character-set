import extendConfiguration from './karma-extend.js';

export default function (config) {
  'use strict';
  config.set(extendConfiguration({
    singleRun: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  }));
};

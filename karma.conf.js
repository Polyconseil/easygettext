/* global module */

module.exports = function(config) {
  config.set({
    autoWatch: true,
    singleRun: true,
    frameworks: ['jspm', 'jasmine', 'phantomjs-shim'],
    jspm: {
      config: 'config.js',
      loadFiles: [
        'src/**/*.spec.js',
      ],
      serveFiles: [
        'src/**/!(*spec).js',
      ],
    },
    preprocessors: {
      'src/**/!(*spec).js': ['babel', 'coverage'],
    },
    coverageReporter: {
      reporters: [
        {
          type: 'text-summary',
        },
        {
          type: 'html',
          dir: 'coverage/',
        },
      ],
    },
    proxies: {
      '/src/': '/base/src/',
      '/jspm_packages/': '/base/jspm_packages/',
    },
    browsers: ['PhantomJS'],
    reporters: ['mocha', 'coverage'],
  });
};

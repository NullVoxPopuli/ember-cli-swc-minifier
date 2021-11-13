'use strict';

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, arguments);

    let defaultOptions = {
      enabled: app.env === 'production',
    };

    if (app.options.sourcemaps && !areSourceMapsEnabled(app.options.sourcemaps)) {
      defaultOptions.sourceMap = false;
    }

    let addonOptions = app.options['ember-cli-swc-minifier'];

    this._swcOptions = Object.assign({}, defaultOptions, addonOptions);
  },

  postprocessTree(type, tree) {
    if (this._swcOptions.enabled === true && type === 'all') {
      const SWCPlugin = require('./lib/broccoli');

      return new SWCPlugin(tree, this._swcOptions);
    } else {
      return tree;
    }
  },
};

function areSourceMapsEnabled(options) {
  if (options.enabled === false) {
    return false;
  }

  let extensions = options.extensions || [];

  if (extensions.indexOf('js') === -1) {
    return false;
  }

  return true;
}

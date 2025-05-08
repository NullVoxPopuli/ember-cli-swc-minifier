'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { SOURCEMAP, SOURCEMAP_INLINE } = process.env;

module.exports = function (defaults) {
  let options = {
    'ember-cli-swc-minifier': {},
  };

  options['ember-cli-swc-minifier'].sourceMap = SOURCEMAP ? true : false;

  if (SOURCEMAP_INLINE) {
    options['ember-cli-swc-minifier'].inlineSourcesContent = true;
  }

  let app = new EmberApp(defaults, {
    emberData: {
      deprecations: {
        // New projects can safely leave this deprecation disabled.
        // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
        // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
        // before upgrading to Ember Data 6.0
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },

    // Add options here
    ...options,
  });

  return app.toTree();
};

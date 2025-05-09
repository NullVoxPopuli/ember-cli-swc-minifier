// Originally from
// https://github.com/ember-cli/broccoli-terser-sourcemap/blob/master/lib/process-file.js
'use strict';

const fs = require('fs').promises;
const debug = require('debug')('ember-cli-swc-minifier');
const swc = require('@swc/core');

const DEFAULT_SWC_OPTIONS = {
  mangle: true,
  ecma: 2022,
  compress: {
    "arguments": false,
    "arrows": true,
    "booleans": true,
    "booleans_as_integers": false,
    "collapse_vars": true,
    "comparisons": true,
    "computed_props": true,
    "conditionals": true,
    "dead_code": true,
    "directives": true,
    "drop_console": false,
    "drop_debugger": true,
    "evaluate": true,
    "expression": false,
    "hoist_funs": false,
    "hoist_props": true,
    "hoist_vars": false,
    "if_return": true,
    "join_vars": true,
    "keep_classnames": false,
    "keep_fargs": false,
    "keep_fnames": false,
    "keep_infinity": false,
    "loops": true,
    "negate_iife": true,
    "properties": true,
    "reduce_funcs": false,
    "reduce_vars": false,
    "side_effects": true,
    "switches": true,
    "typeofs": true,
    "unsafe": false,
    "unsafe_arrows": false,
    "unsafe_comps": false,
    "unsafe_Function": false,
    "unsafe_math": false,
    "unsafe_symbols": false,
    "unsafe_methods": false,
    "unsafe_proto": false,
    "unsafe_regexp": false,
    "unsafe_undefined": false,
    "unused": true,
    "const_to_let": true,
    "pristine_globals": true,
    "passes": 3
  },
};

module.exports = async function processFile(
  inFile,
  outFile,
  relativePath,
  outDir,
  silent,
  _options
) {
  let src = await fs.readFile(inFile, 'utf-8');
  let options = Object.assign(DEFAULT_SWC_OPTIONS, _options?.swc || {});

  if (_options.sourceMap) {
    options.sourceMap = true;
  }

  options.compress = Object.assign(DEFAULT_SWC_OPTIONS.compress, _options?.swc?.compress ?? {});

  let start = new Date();

  debug('[starting]: %s %dKB', relativePath, src.length / 1000);

  try {
    /**
     * Returns
     *  - code: string
     *  - map: string
     *
     * https://swc.rs/docs/usage/core#minify
     */
    let { code: outCode, map: outMap } = await swc.minify(src, options);

    let end = new Date();
    let total = end - start;

    if (total > 20000 && !silent) {
      console.warn(
        `[WARN] (ember-cli-swc-minifier) Minifying "${relativePath}" took: ${total}ms (more than 20,000ms)`
      );
    }

    await Promise.all([
      fs.writeFile(outFile, outCode),
      fs.writeFile(outFile + '.map', outMap),
    ]);

    debug('[finished]: %s %dKB in %dms', relativePath, outCode.length / 1000, total);
  } catch (e) {
    e.filename = relativePath;
    throw e;
  }
};

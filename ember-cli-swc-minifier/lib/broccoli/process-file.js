// Originally from
// https://github.com/ember-cli/broccoli-terser-sourcemap/blob/master/lib/process-file.js
'use strict';

const fs = require('fs').promises;
const debug = require('debug')('ember-cli-swc-minifier');
const defaults = require('lodash.defaultsdeep');
const swc = require('@swc/core');

module.exports = async function processFile(
  inFile,
  outFile,
  relativePath,
  outDir,
  silent,
  _options
) {
  let src = await fs.readFile(inFile, 'utf-8');
  let swcMinifyOptions = [
    `compress`,
    `mangle`,
    `format`,
    `ecma`,
    `keepClassnames`,
    `keepFnames`,
    `module`,
    `safari10`,
    `toplevel`,
    `sourceMap`,
    `outputPath`,
    `inlineSourcesContent`,
  ];
  let options = Object.entries(defaults({}, _options)).reduce((result, [optionName, value]) => {
    if (swcMinifyOptions.includes(optionName)) {
      result[optionName] = value;
    }

    return result;
  }, {});
  let start = new Date();

  debug('[starting]: %s %dKB', relativePath, src.length / 1000);

  try {
    /**
     * Returns
     *  - code: string
     *  - map: string
     *
     * https://github.com/swc-project/swc/blob/b869c81888553b870a5a2c79c6ef49354df15670/node-swc/src/types.ts#L807
     */
    let { code: outCode } = await swc.minify(src, {
      /**
       * All options here:
       *
       * https://github.com/swc-project/swc/blob/b869c81888553b870a5a2c79c6ef49354df15670/node-swc/src/types.ts#L17
       */
      compress: true, // TerserCompressOptions | boolean,
      mangle: true, //TerserMangleOptions | boolean,
      // ecma?: TerserEcmaVersion,
      // keep_classnames?: boolean,
      // keep_fnames?: boolean,
      // module?: boolean,
      // safari10?: boolean
      // toplevel?: boolean
      // outputPath: outFile,
      // inlineSourcesContent?: boolean
      ...options,
    });

    let end = new Date();
    let total = end - start;

    if (total > 20000 && !silent) {
      console.warn(
        `[WARN] (ember-cli-swc-minifier) Minifying "${relativePath}" took: ${total}ms (more than 20,000ms)`
      );
    }

    await fs.writeFile(outFile, outCode);

    // let outCode = await fs.readFile(outFile, 'utf-8');

    debug('[finished]: %s %dKB in %dms', relativePath, outCode.length / 1000, total);
  } catch (e) {
    e.filename = relativePath;
    throw e;
  }
};

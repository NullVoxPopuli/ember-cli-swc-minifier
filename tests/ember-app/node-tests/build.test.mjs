'use strict';

import del from 'del';
import { execa } from 'execa';
import fs from 'fs/promises';
import { globby, globbySync } from 'globby';
import { beforeEach, expect, test } from 'vitest';

beforeEach(async () => {
  await del(['./dist']);
});

function exists(glob) {
  let result = globbySync(glob, { expandDirectories: true });

  return result.length > 0;
}

async function build(env = {}) {
  await execa('ember', ['build', '--environment', 'production'], {
    env,
    stdio: 'inherit',
  });
}

async function hasSourceMappingURL(glob, expectation) {
  let key = '//# sourceMappingURL';
  let files = await globby(glob, { expandDirectories: true });

  if (files.length === 0) {
    return false;
  }

  for (let file of files) {
    let data = await fs.readFile(file);

    if (!data.includes(key)) {
      if (expectation) {
        console.error(`${file} did not have content matching ${key}`);
      }

      return false;
    }
  }

  return true;
}

async function hasJSSourceMapsURL(expectation) {
  return await hasSourceMappingURL('dist/**/*.js', expectation);
}

test('basic build', async () => {
  await build();

  expect(exists('dist/**/*.map')).toBeFalsy();
  expect(await hasJSSourceMapsURL(false)).toBeFalsy();
}, 60_000);

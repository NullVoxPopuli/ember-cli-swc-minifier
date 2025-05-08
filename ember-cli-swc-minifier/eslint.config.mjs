import { configs } from '@nullvoxpopuli/eslint-configs';

export default [
  ...configs.node(import.meta.dirname),
  {
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    }
  }
];

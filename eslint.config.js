import pluginAstro from 'eslint-plugin-astro';

export default [
  ...pluginAstro.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/'],
  },
];

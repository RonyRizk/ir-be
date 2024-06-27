import { Config } from '@stencil/core';
import tailwind, { setPluginConfigurationDefaults, tailwindGlobal, tailwindHMR } from 'stencil-tailwind-plugin';
const opts = {
  debug: false,
  stripComments: true,
};

setPluginConfigurationDefaults(opts);
export const config: Config = {
  namespace: 'iglooroom',
  plugins: [
    tailwindGlobal({ minify: true, useAutoPrefixer: true }),
    tailwind({
      useAutoPrefixer: true,
      minify: true,
      // tailwindCssPath: 'tailwind.config.js',
      postcss: {
        plugins: [require('postcss-import'), require('tailwindcss'), require('autoprefixer')],
      },
    }),
    tailwindHMR({ minify: true, useAutoPrefixer: true }),
  ],
  // devServer: {
  //   reloadStrategy: 'pageReload',
  // },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'assets',
        },
      ],
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [
        {
          src: 'assets',
        },
        { src: 'index.js' },
      ], // disable service workers
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};

/* eslint-disable @typescript-eslint/no-var-requires */

const plugins = [
  require('postcss-import'),
  require('tailwindcss'),
  require('postcss-preset-env')({ stage: 1 })
];

if (process.env.NODE_ENV !== 'development') {
  plugins.push(require('autoprefixer')); // crash chrome when inspecting element, so disable it in development mode
}

module.exports = {
  plugins,
};

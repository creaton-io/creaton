const { addBeforeLoader, loaderByName } = require('@craco/craco');
const path = require("path");
const fs = require("fs");


const rewireBabelLoader = require("craco-babel-loader");

// helpers

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');

      webpackConfig.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
          if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });

      const wasmLoader = {
        test: /\.wasm$/,
        include: path.resolve(__dirname, 'src'),
        loaders: ['wasm-loader'],
      };

      addBeforeLoader(webpackConfig, loaderByName('file-loader'), wasmLoader);

      return webpackConfig;
    },
  },
  plugins: [
    //This is a craco plugin: https://github.com/sharegate/craco/blob/master/packages/craco/README.md#configuration-overview
    { plugin: rewireBabelLoader, 
      options: { 
        includes: [resolveApp("node_modules/react-scripts"), resolveApp("node_modules/did-jwt"), resolveApp("node_modules/3id-did-provider"), resolveApp("node_modules/key-did-provider-ed25519"), resolveApp("node_modules/dids")], //put things you want to include in array here
        //excludes: [/(node_modules|bower_components)/] //things you want to exclude here
        //you can omit include or exclude if you only want to use one option
      }
    }
]
}

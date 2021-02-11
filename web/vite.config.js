import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

module.exports = {
  // minify: false,
  // sourcemap: true,
  optimizeDeps: {
    exclude: ['@textile/hub', 'web3w'], // allow to develop web3w with hot reload
  },
  rollupInputOptions: {
    pluginsOptimizer: [globals(), insertBuiltinsPlugin()],
  },
};

function insertBuiltinsPlugin() {
  return {
    name: 'creaton:insert-builtins-plugin',
    options(options) {
      const plugins = options.plugins;
      const idx = plugins.findIndex((plugin) => plugin.name === 'node-resolve');
      plugins.splice(idx, 0, builtins({crypto: true, stream: true}));
      return options;
    },
  };
}

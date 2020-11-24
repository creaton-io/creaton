//import builtins from 'rollup-plugin-node-builtins';

//const builtinsPlugin = builtins({crypto: true});
//builtinsPlugin.name = 'builtins'; // required, see https://github.com/vitejs/vite/issues/728

module.exports = {
  // minify: false,
  // sourcemap: true,
  optimizeDeps: {
    exclude: ['@textile/hub', 'web3w'], // allow to develop web3w with hot reload
  },
  //rollupInputOptions: {
  //  plugins: [builtinsPlugin],
  //},
};

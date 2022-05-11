const webpack = require('webpack'); 
module.exports = function override(config) { 
    const fallback = config.resolve.fallback || {}; 

    Object.assign(fallback, { 
        "url": require.resolve("url"),
        "assert": require.resolve("assert"), 
        "crypto": require.resolve("crypto-browserify"), 
        "http": require.resolve("stream-http"), 
        "https": require.resolve("https-browserify"), 
        "os": require.resolve("os-browserify"), 
        "buffer": require.resolve('buffer'),
        "stream": require.resolve("stream-browserify"), 
        "path": require.resolve('path-browserify'),
    });
   
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({ 
            process: 'process/browser', 
            Buffer: ['buffer', 'Buffer'] 
        }) 
    ]);
    
    config.module.rules.unshift({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false, // disable the behavior
        },
    });

   return config; 
}

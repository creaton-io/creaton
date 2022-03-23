module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
}

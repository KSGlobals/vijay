const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      zlib: require.resolve("browserify-zlib"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
      fs: false, // Use 'false' to exclude the 'fs' module
      path: require.resolve("path-browserify"),
      zlib: false,
      crypto: require.resolve("crypto-browserify"),
    },
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/.*/, (data) => {
      if (/critical dependency/.test(data.message)) {
        return;
      }
    }),
  ],
};

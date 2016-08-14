var HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: './example/overlay.js',
  output: {
    filename: './build/bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({ filename: './build/index.html', template: './example/template.html'}),
  ],
};

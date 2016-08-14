const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const template = 'example/template.html';

const entries = {
  simple:   './example/simple.js',
  overlay: './example/overlay.js',
};
const plugins = Object.keys(entries).map(name =>
  new HtmlWebpackPlugin({template, filename: name + '.html', chunks: [name]})
);

module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }]
  },
  plugins
};

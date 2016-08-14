const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  devtool: 'cheap-module-source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true}),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ].concat(plugins),
};

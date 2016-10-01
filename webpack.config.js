const glob = require('glob').sync;
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const template = 'example/template.html';

const entries = glob( path.join(__dirname, 'example', '*.js') )
  .reduce( (entries, name) => {
    entries[path.basename(name, '.js')] = name;
    return entries;
  }, {});

entries['infinigrid'] = path.join(__dirname, 'src', 'index.js' );

const plugins = Object.keys(entries).map(name =>
  new HtmlWebpackPlugin({template, filename: name + '.html', chunks: [name]})
);

if (process.env.NODE_ENV == 'production') {
  plugins.unshift(
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  );
}
module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
    ],
    postLoaders: [
      {
        test: /\.js$/,
        loader: 'transform?brfs',
      },
    ]
  },
  node: {
    fs: 'empty',
  },
  plugins,
  resolve: {
    alias: {
      infinigrid: path.join(__dirname, 'src/index.js')
    }
  }
};

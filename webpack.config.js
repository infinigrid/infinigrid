module.exports = {
    entry: './demo.js',
    output: {
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
         }]
     }
};

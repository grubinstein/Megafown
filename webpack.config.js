const path = require('path')
const webpack = require('webpack')
require("babel-polyfill")
// Define webpack config and loaders here
module.exports = {
  mode: 'development',
  entry: 
    [ 
      '@babel/polyfill',
      './app/main.js',
      'webpack-hot-middleware/client'
    ],
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['babel-plugin-transform-es2015-destructuring', 'babel-plugin-transform-object-rest-spread']
          }
        }
      },
      {
        test: /\.css$/,
        use: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader'
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader'
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  }
}

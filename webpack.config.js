const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');  // Add this line
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Call dotenv and it will return an Object with a parsed key 
const env = dotenv.config().parsed || {};

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './app/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: isProduction ? '/checklist/' : '/', // Set the publicPath for GitHub Pages
  },
  plugins: [
    new webpack.DefinePlugin({
      ...envKeys,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: true
    }),
  ],
  devServer: {
    headers: {
      'Content-Security-Policy': "frame-ancestors 'self' https://accounts.google.com"
    },
  },
};
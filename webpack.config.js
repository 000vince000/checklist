const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed;

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
    publicPath: '/checklist/', // This should match your GitHub Pages path
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: 'public/index.html', 
          to: 'index.html',
          transform(content) {
            return content.toString().replace(
              /%REACT_APP_GOOGLE_CLIENT_ID%/g,
              env.REACT_APP_GOOGLE_CLIENT_ID
            ).replace(
              /%REACT_APP_GOOGLE_API_KEY%/g,
              env.REACT_APP_GOOGLE_API_KEY
            ).replace(
              /%REACT_APP_GOOGLE_DISCOVERY_DOCS%/g,
              env.REACT_APP_GOOGLE_DISCOVERY_DOCS
            );
          },
        },
        { from: '.nojekyll', to: '.nojekyll', noErrorOnMissing: true },
      ],
    }),
    // Remove the DefinePlugin instances as we're not using process.env anymore
  ],
  optimization: {
    minimize: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
};
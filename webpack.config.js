const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

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
        { from: 'public/index.html', to: 'index.html' },
        { from: '.nojekyll', to: '.nojekyll' },
      ],
    }),
  ],
  optimization: {
    minimize: true,
  },
};
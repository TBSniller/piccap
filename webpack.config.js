const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'all': [
      path.resolve(__dirname, './frontend/js/ui.js'),
      path.resolve(__dirname, './frontend/js/servicecalls.js'),
      path.resolve(__dirname, './frontend/js/spatial-navigation.js'),
    ]
  },
  target: 'browserslist',
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        exclude: /core-js/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    path: path.resolve(__dirname, './build/piccap-frontend/'),
    filename: './[name].bundled.js',
  },
  performance: {
    maxAssetSize: 1000000
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ context: 'frontend', from: '**', to: '.' }],
    }),
  ],
};
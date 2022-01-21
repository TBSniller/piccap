const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ShebangPlugin = require('webpack-shebang-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => [
  // Frontend
  {
    target: 'browserslist',
    mode: env.production ? 'production' : 'development',
    entry: {
      'js/script.js': './piccap/js/script.js',
    },
    output: {
      path: path.resolve(__dirname, './dist/frontend/'),
      filename: '[name]',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /core-js/,
          use: 'babel-loader',
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ context: 'piccap', from: '**', to: '.' }],
      }),
    ],
  },
];

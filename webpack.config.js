/* eslint-env node */
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const srcPath  = path.join(__dirname, 'src');
const distPath = path.join(__dirname, 'dest');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|svg)$/,
        loader: 'url-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true,
              importLoaders: 2
            },
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                // fiber: require('fibers'),
                fiber: false,
              },
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
    ]
  },
  entry: {
    script: path.join(srcPath, 'index.ts')
  },
  output: {
    filename: '[name].js',
    path: distPath,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: path.join(srcPath, 'index.html') }
      ]
    }),
  ],
  mode: 'development',
  devtool: 'cheap-source-map',
  stats: {
    builtAt: true,
    errorsCount: true,
    warningsCount: true,
    timings: true,
  },
  watchOptions: {
    ignored: /(node_modules)|(dist)/,
  },
  resolve: {
    alias: {
      src: srcPath
    },
    extensions: [".js", ".ts"]
  },
}
const webpack = require('webpack');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const glob = require('glob');

const buildPath = path.resolve(__dirname, 'dist');

const client = {
  context: __dirname,
  entry: './src/client/client.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new RemovePlugin({
      before: {
        include: [path.resolve(buildPath, 'client')],
      },
      watch: {
        include: [path.resolve(buildPath, 'client')],
      },
    }),
    new ESLintPlugin(),
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      events: require.resolve('events/'),
    },
  },
  output: {
    filename: '[contenthash].client.js',
    path: path.resolve(buildPath, 'client'),
  },
};

module.exports = [client];

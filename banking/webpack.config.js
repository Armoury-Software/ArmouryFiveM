const webpack = require('webpack');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const fs = require('fs');

const buildPath = path.resolve(__dirname, 'dist');

const server = {
  context: __dirname,
  entry: './src/server/server.ts',
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
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new RemovePlugin({
      before: {
        include: [path.resolve(buildPath, 'server')],
      },
      watch: {
        include: [path.resolve(buildPath, 'server')],
      },
    }),
    new ESLintPlugin(),
    function () {
      this.hooks.done.tap('SaveFileNamePlugin', (stats) => {
        removeCfxOccurences(`./dist/server/${stats.toJson().assetsByChunkName.main[0]}`);
      });
    },
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  output: {
    filename: '[contenthash].server.js',
    path: path.resolve(buildPath, 'server'),
  },
  target: 'node',
};

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
    function () {
      this.hooks.done.tap('SaveFileNamePlugin', (stats) => {
        removeCfxOccurences(`./dist/client/${stats.toJson().assetsByChunkName.main[0]}`);
      });
    },
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  output: {
    filename: '[contenthash].client.js',
    path: path.resolve(buildPath, 'client'),
  },
};

const removeCfxOccurences = (filePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    // Remove occurrences of "Cfx.Client." and "Cfx."
    const modifiedContent = data
      .replace(/Cfx\.Client\./g, '')
      .replace(/Cfx\.Server\./g, '')
      .replace(/Cfx\./g, '');

    // Write the modified content back to the file
    fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('Occurrences removed from file:', filePath);
    });
  });
};

module.exports = [server, client];

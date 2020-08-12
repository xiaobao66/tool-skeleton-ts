const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// 分析构建结果
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
// 获取命令行参数
const { argv } = require('yargs')
  .boolean('release')
  .boolean('analyze')
  .boolean('verbose')
  .default({
    release: false,
    analyze: false,
    verbose: false,
  });

const { release, analyze: isAnalyze, verbose: isVerbose } = argv;
const isDebug = !release;

const ROOT_DIR = path.resolve(__dirname, '..');
const resolvePath = (...args) => path.resolve(ROOT_DIR, ...args);
const SRC_DIR = resolvePath('src');
const BUILD_DIR = resolvePath('build');

module.exports = {
  context: ROOT_DIR,

  mode: isDebug ? 'development' : 'production',

  devtool: isDebug ? 'inline-source-map' : false,

  entry: {
    tool: ['./src/index.ts'],
  },

  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    library: 'tool',
    libraryTarget: 'umd',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        // 抽取node_modules中的js模块
        vendors: {
          name: 'vendors',
          // Note the usage of `[\\/]` as a path separator for cross-platform compatibility
          test: /[\\/]node_modules[\\/].*\.js$/,
          chunks: 'initial',
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        include: [SRC_DIR],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: isDebug,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: isDebug,
    }),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enable: true,
        files: './src/**/*.ts',
      },
    }),
    new CleanWebpackPlugin(),
    ...(isAnalyze
      ? [new BundleAnalyzerPlugin(), new DuplicatePackageCheckerPlugin()]
      : []),
  ],

  stats: {
    cached: false,
    cachedAssets: false,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
  },
};

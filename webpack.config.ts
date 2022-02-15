import { resolve } from 'path';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import { Compiler, Configuration } from 'webpack';

import 'webpack-dev-server'; // Augment "Configuration" type
import { author, description, homepage, keywords, name, repository, title } from './package.json';
import compile from './src/print';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
const out = 'ccjmne-resume';

export default (
  _env: string,
  { mode = 'production', port = 8042 }: { mode?: 'production' | 'development', port?: number } = {},
): Configuration => ({
  entry: {
    scss: resolve(src, 'index.scss'),
    main: resolve(src, 'index.ts'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, {
      test: /exported-vars\.scss$/,
      use: [
        'style-loader',
        'css-modules-typescript-loader',
        { loader: 'css-loader', options: { modules: 'icss' } },
        'sass-loader',
      ],
    }, {
      test: /(?<!exported-vars)\.scss?$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: /node_modules/,
    }, {
      test: /\.svg$/,
      // see https://webpack.js.org/guides/asset-modules/
      type: 'asset/inline',
      generator: {
        dataUrl: (content: string | Buffer) => svgToMiniDataURI(String(content)),
      },
    }],
  },
  resolve: {
    alias: { src },
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['src', 'node_modules'],
  },
  devtool: mode === 'development' ? 'eval' : false,
  devServer: {
    port,
    devMiddleware: {
      index: `${out}.html`,
      writeToDisk: true,
    },
  },
  output: {
    path: dist,
  },
  plugins: [
    ...mode === 'production' ? [new CleanWebpackPlugin()] : [],
    new HtmlWebpackPlugin({
      title: name,
      meta: { author, description, repository, keywords: keywords.join(', ') },
      filename: resolve(dist, `${out}.html`),
    }),
    (compiler: Compiler) => {
      /**
       * Use `afterDone` rather than `afterEmit` to prevent deadlock
       * where this hook attempts to query the devServer while the devServer
       * waits for all compilation hooks to be resolved before serving content.
       */
      compiler.hooks.afterDone.tap('AfterDonePlugin', () => compile(
        resolve(dist, `${out}.html`),
        resolve(dist, `${out}.pdf`),
        { properties: { author, creator: `${name} (${homepage})`, keywords: keywords.join(', '), title, subject: description } },
      ));
    },
  ],
});

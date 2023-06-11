import { resolve } from 'path'

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import svgToMiniDataURI from 'mini-svg-data-uri'
import { type Configuration } from 'webpack'

import 'webpack-dev-server' // Augment "Configuration" type
import { author, description, homepage, keywords, name, repository, title } from './package.json'
import { PDFPrinter } from './tooling/pdf-printer-plugin'

const src = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')
const tools = resolve(__dirname, 'tooling')
const out = 'ccjmne-resume'

export default (
  _env: string,
  { mode = 'production', port = '8042' }: { mode?: 'production' | 'development', port?: string } = {},
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
      test: /\.(png|jpe?g|gif)$/i,
      resourceQuery: /dataURI/,
      use: { loader: 'url-loader', options: { limit: true } },
    }, {
      test: /\.svg$/,
      enforce: 'pre',
      use: 'svgo-loader',
    }, {
      test: /\.svg$/, // w/o `?template` query param
      resourceQuery: /template/,
      use: resolve(tools, 'template-element-loader.ts'),
    }, {
      test: /\.svg$/, // w/ `?template` query param
      resourceQuery: query => !/template/.test(query),
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
      template: resolve(src, 'index.html'),
      filename: resolve(dist, `${out}.html`),
    }),
    new PDFPrinter({
      ...mode === 'production' ? { scheme: 'file', path: resolve(dist, `${out}.html`) } : { port },
      output: resolve(dist, `${out}.pdf`),
      properties: { title, author, subject: description, keywords: keywords.join(', '), creator: `${name} (${homepage})` },
      blocking: mode === 'production',
    }),
  ],
})

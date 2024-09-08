import { resolve } from 'path'

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import svgToMiniDataURI from 'mini-svg-data-uri'
import { WebpackPluginInstance, type Configuration } from 'webpack'

import { readdirSync } from 'fs'
import { Compiler } from 'webpack'
import 'webpack-dev-server' // Augment "Configuration" type
import { author, description, homepage, keywords, name, repository, title } from './package.json'
import { PDFPrinter } from './tooling/pdf-printer-plugin'

const src = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')
const tools = resolve(__dirname, 'tooling')
const out = 'ccjmne-resume'

class TypedScssModulesPlugin implements WebpackPluginInstance {
  public apply(compiler: Compiler): void {
    compiler.hooks.afterPlugins.tap('TypedScssModulesPlugin', () => require('child_process').spawn(
      'npx', ['typed-scss-modules', 'src/scss/**/*.module.scss', '--watch'], { stdio: 'inherit' }
    ))
  }
}

const pages = readdirSync(src, { withFileTypes: true })
  .filter(({ name }) => /\d+[.]ts$/.test(name))
  .map(({ name }) => ({ path: resolve(src, name), name: name.replace(/[.]ts$/, '') }))
  .reduce((acc, { name, path }) => ({ ...acc, [name]: path }), {})

export default (
  _env: string,
  { mode = 'production', port = '8042' }: { mode?: 'production' | 'development', port?: string } = {},
): Configuration => ({
  entry: pages,
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, {
      test: /\.module\.scss$/,
      use: [
        { loader: 'css-loader', options: { modules: 'icss' } },
        { loader: 'sass-loader' },
      ],
    }, {
      test: /(?<!\.module)\.scss$/,
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
      index: '1.html',
    },
  },
  output: {
    path: dist,
  },
  plugins: [
    ...mode === 'production' ? [new CleanWebpackPlugin()] : [],
    new TypedScssModulesPlugin(),
    ...Object.entries(pages).map(([name, path]) => new HtmlWebpackPlugin({
      title: `Page ${name}`,
      meta: { author, description, repository, keywords: keywords.join(', ') },
      chunks: [name],
      template: resolve(src, 'index.html'),
      filename: resolve(dist, `${name}.html`),
    })),
    new PDFPrinter({
      ...mode === 'production'
        ? { scheme: 'file', paths: Object.keys(pages).map(name => resolve(dist, `${name}.html`)) }
        : { port, paths: Object.keys(pages).map(name => `${name}.html`) },
      output: resolve(dist, `${out}.pdf`),
      properties: { title, author, subject: description, keywords: keywords.join(', '), creator: `${name} (${homepage})` },
      blocking: mode === 'production',
    }),
  ],
})

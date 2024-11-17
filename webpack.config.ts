import { resolve } from 'path'

import HtmlWebpackPlugin from 'html-webpack-plugin'
import svgToMiniDataURI from 'mini-svg-data-uri'
import { WebpackPluginInstance, type Configuration } from 'webpack'

import { readdirSync } from 'fs'
import { Compiler } from 'webpack'
import 'webpack-dev-server' // Augment "Configuration" type
import { author, description, homepage, keywords, name, repository, title } from './package.json'
import { PDFPrinter } from './tooling/pdf-printer-plugin'
import { DefinePlugin } from 'webpack'

const src = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')
const tools = resolve(__dirname, 'tooling')

class TypedScssModulesPlugin implements WebpackPluginInstance {
  public constructor(private readonly config: { watch: boolean } = { watch: false }) { }

  public apply(compiler: Compiler): void {
    compiler.hooks.afterPlugins.tap('TypedScssModulesPlugin', () => require('child_process').spawn(
      'npx', ['typed-scss-modules', 'src/scss/**/*.module.scss', this.config.watch ? '--watch' : ''], { stdio: 'inherit' },
    ))
  }
}

const pages = readdirSync(src, { withFileTypes: true })
  .filter(({ name }) => /\d+[.]ts$/.test(name))
  .map(({ name }) => ({ path: resolve(src, name), name: name.replace(/[.]ts$/, '') }))
  .reduce((acc, { name, path }) => ({ ...acc, [name]: path }), {})

export default (
  env: NodeJS.ProcessEnv,
  { mode = 'production', port = '8042' }: { mode?: 'production' | 'development', port?: string } = {},
): Configuration => ({
  entry: pages,
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, {
      test: /\.scss$/,
      use: [
        { loader: 'style-loader' },
        {
          loader: 'css-loader',
          options: { modules: { auto: true, exportLocalsConvention: 'camel-case-only' } },
        },
        {
          loader: 'sass-loader',
          options: { api: "modern-compiler", sassOptions: { implementation: require('sass-embedded') } }
        },
      ],
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
      test: /\.svg$/,
      resourceQuery: /template/,
      use: resolve(tools, 'template-element-loader.ts'),
    }, {
      test: /\.svg$/,
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
  output: { path: dist, clean: mode === 'production' },
  stats: { all: mode === 'development' },
  plugins: [
    new DefinePlugin({ 'process.env': JSON.stringify(env) }),
    new TypedScssModulesPlugin({ watch: mode === 'development' }),
    ...Object.keys(pages).map(name => new HtmlWebpackPlugin({
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
      output: resolve(dist, env.OUTPUT ?? `${name}.pdf`),
      date: env.DATE ? new Date(env.DATE) : undefined,
      properties: { title, author, subject: description, keywords: keywords.join(', '), creator: `${name} (${homepage})` },
      blocking: mode === 'production',
    }),
  ],
})

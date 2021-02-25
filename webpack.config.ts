import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import { resolve } from 'path';
import { Compiler, Configuration } from 'webpack';
import { author, description, homepage, keywords, name, repository, title } from './package.json';
import compile from './src/print';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
export default (_env: string, { mode }: { mode ? : 'production' | 'development' } = { mode: 'production' }): Configuration => ({
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
      use: ['style-loader', { loader: 'css-loader', options: { modules: { compileType: 'icss' } } }, 'sass-loader'],
    }, {
      test: /(?<!exported-vars)\.scss?$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: /node_modules/,
    }, {
      test: /\.svg$/,
      // see https://webpack.js.org/guides/asset-modules/
      type: 'asset/inline',
      generator: { dataUrl: (content: unknown) => svgToMiniDataURI(content.toString()) },
    }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    modules: ['src', 'node_modules'],
  },
  devtool: mode === 'development' ? 'eval' : false,
  devServer: {
    writeToDisk: true,
    index: 'ccjmne-resume.html',
  },
  output: {
    path: dist,
  },
  plugins: [].concat(
    mode === 'production' ? new CleanWebpackPlugin() : [],
    new HtmlWebpackPlugin({
      meta: { author, description, repository, keywords: keywords.join(', ') },
      filename: resolve(dist, 'ccjmne-resume.html'),
    }),
    (compiler: Compiler) => {
      compiler.hooks.afterEmit.tapPromise('AfterEmitPlugin', () => compile(
        resolve(dist, 'ccjmne-resume.html'),
        resolve(dist, 'ccjmne-resume.pdf'),
        { properties: { author, creator: `${name} (${homepage})`, keywords: keywords.join(', '), title, subject: description } },
      ));
    },
  ),
});

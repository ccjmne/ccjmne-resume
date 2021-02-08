import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import { Compiler, Configuration } from 'webpack';
import { author, description, homepage, keywords, name, repository, title } from './package.json';
import compile from './src/print';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
export default (_env: string, { mode }: { mode ? : 'production' | 'development' } = { mode: 'production' }): Configuration => ({
  entry: {
    scss: resolve(src, 'style.scss'),
    main: resolve(src, 'index.ts'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, {
      test: /\.scss?$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: /node_modules/,
    }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: mode === 'development' && 'eval',
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

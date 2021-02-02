import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import { Configuration } from 'webpack';
import { author, description, keywords, repository } from './package.json';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
export default (_env: string, { mode }: { mode ? : 'production' | 'development' } = { mode: 'production' }): Configuration => ({
  entry: {
    main: resolve(src, 'index.ts'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: mode === 'development' && 'eval',
  output: {
    filename: 'bundle.js',
    path: dist,
  },
  plugins: [].concat(
    new HtmlWebpackPlugin({
      template: resolve(__dirname, resolve(src, 'index.html')),
      chunks: ['main'],
      chunksSortMode: 'manual',
      meta: { author, description, repository, keywords: keywords.join(', ') },
    }),
  ),
});

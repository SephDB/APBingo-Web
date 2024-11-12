const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(css|scss)?$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|svg)/,
        type: 'asset',
        generator: {
          // save images to file
          filename: 'img/[name].[hash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            // inline images < 2 KB
            maxSize: 2 * 1024,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts",".js"]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devServer: {
    static: path.join(__dirname, "dist"),
    watchFiles: {
      paths: ['./src/**/*.*'],
      options: {
        usePolling: true
      }
    },
    compress: true,
    port: 4000,
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: './src/views',
      css: {
        filename: 'css/[name].css'
      }
    })
  ]
};
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const DotEnvWebpack = require('dotenv-webpack');

// make .env variables available inside this config file and add them to process.env
const envConfig = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }).parsed;
for (let k in envConfig) {
    process.env[k] = envConfig[k];
}

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || '8080';
const HTTPS = Number.parseInt(process.env.WEBPACK_DEV_SERVER_HTTPS) == true;


const config = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'build.js'
  },
  resolve: {
	alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js']
  },
  devtool: 'eval-cheap-module-source-map',
  module: {
    rules: [{
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
		        loaders: {
			      }
          }
        }]
      },
	  {
		test: /\.js$/,
		use: [
          { loader: 'babel-loader' },
          { loader: 'imports-loader?define=>false' },
        ]
	  },
	  {
		test: /\.css$/,
		use: [
		  {
		    loader: MiniCssExtractPlugin.loader,
            options: {
		    },
		  },
		  'css-loader',
	    ]
	  },
    {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
    },
    {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
			      esModule: false,
            name: '[name].[ext]?[hash]'
          }
        }]
    },
	  {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
           'file-loader',
        ],
      },
    ],
  },
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    open: true,
    openPage: `${HTTPS ? 'https' : 'http'}://localhost:${PORT}/`,
    ...HTTPS && { https: true },
    // use credentials if provided
    ...process.env.WEBPACK_DEV_SERVER_PRIVATE_KEY && { key: fs.readFileSync(path.resolve(process.env.WEBPACK_DEV_SERVER_PRIVATE_KEY)) },
    ...process.env.WEBPACK_DEV_SERVER_CERTIFICATE && { cert: fs.readFileSync(path.resolve(process.env.WEBPACK_DEV_SERVER_CERTIFICATE)) },
    ...process.env.WEBPACK_DEV_SERVER_CA && { ca: fs.readFileSync(path.resolve(process.env.WEBPACK_DEV_SERVER_CA)) }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
	    entry: 'index.html',
      template: 'index.html',
      title: 'Weather Forecast Demo',
      inject: 'body'
    }),
	  new MiniCssExtractPlugin({filename:"main.css"}),
	  new VueLoaderPlugin(),
    new DotEnvWebpack({ path: path.resolve(__dirname, '../../.env') })
  ],
  devtool: '#eval-source-map'
};

module.exports = config;

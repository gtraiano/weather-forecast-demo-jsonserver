const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '8080';

const config = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'build.js',
    publicPath: './'
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
          { loader: 'imports-loader?define=>false'},
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
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
	  entry: 'index.html',
      baseUrl: '/',
      template: 'index.html',
      title: 'demo weather forecast',
      inject: 'body'
    }),
	new MiniCssExtractPlugin({filename:"main.css"}),
	new VueLoaderPlugin(),
	new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new Dotenv({ path: path.resolve(__dirname, '../../.env') }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ],
  optimization: {
	  minimizer: [
		new UglifyJsPlugin({
		  sourceMap: true,
		  uglifyOptions: {
			warnings: false,
		    compress: {
		    }
		  }
        }),
	  ]
  },
  devtool: '#source-map'
};

module.exports = config;

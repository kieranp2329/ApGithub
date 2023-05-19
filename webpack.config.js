const webpack = require('webpack');
const path = require('path');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');
//Plugins
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const PurgecssPlugin = require('purgecss-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const alias = { svelte: path.resolve('node_modules', 'svelte') };
const extensions = ['.mjs', '.js', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];

var styleLoader = [
  {
    loader: 'postcss-loader', // Run post css actions
    options: {
      sourceMap: true, // 'inline',
      plugins: function () { // post css plugins, can be exported to postcss.config.js
        return [
          require('precss'),
          require('autoprefixer'),
        ];
      },
    },
  }, {
    loader: 'sass-loader', // compiles Sass to CSS
    options: {
      sourceMap: true,
    },
  },
];

module.exports = {
	client: {
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: { alias, extensions, mainFields },
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							hydratable: true,
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
				},
				// added by me to handle Bootstrap, etc, one place for global styling
        {
          test: /\.(css|scss)$/,
          use: styleLoader,
        },
        { test: /\.(jpe?g|png|gif)$/, use: 'file-loader' },
        // taken from gowravshekar/bootstrap-webpack
        { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?mimetype=application/font-woff' }, //eslint-disable-line
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?mimetype=application/octet-stream' }, //eslint-disable-line
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?mimetype=image/svg+xml' },
			]
		},
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
				filename: '[hash]/[name].css',
        chunkFilename: '[hash]/[id].css',
			}),
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: config.server.entry(),
		output: config.server.output(),
		target: 'node',
		resolve: { alias, extensions, mainFields },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							dev
						}
					}
				}
			]
		},
		mode: process.env.NODE_ENV,
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: process.env.NODE_ENV
	}
};
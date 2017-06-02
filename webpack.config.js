const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: {
		bundle: './app/main.js'
	},
	output: {
		path: path.resolve(__dirname, './app/wpk'),
		filename: '[name].js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
            use: [{
				loader: 'ng-annotate-loader'
			}, {
				loader: 'babel-loader'
			}]
		},
		{
				test: /\.html$/,
				use: [{
					loader: 'ngtemplate-loader',
					options: {
						relativeTo: 'app'
					}
				}, {
					loader: 'html-loader',
					options: {
						attrs: 'img-svg:src',
						root: path.resolve('./app')
					}
				}]
			}]
	},
    devtool: 'source-map',
	plugins: [
		// new ExtractTextPlugin('[name].css'),
		// new webpack.optimize.UglifyJsPlugin({
		// 	sourceMap: true,
		// 	compress: {
		// 		warnings: false
		// 	},
		// 	output: {
		// 		comments: false,
		// 	}
		// })
	]
};

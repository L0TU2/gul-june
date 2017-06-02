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

const path = require('path');

module.exports = {
	target: 'node0.10',
	mode: 'development',
	devtool: false,
	entry: './source.js',
	output: {
		filename: 'piccap.js',
		path: path.resolve(__dirname, './piccap.service/')
	},
	externals: {
		'webos-service': 'commonjs2 webos-service',
	},
	module: {
		rules: [
			{
				test: /.js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
			}
		]
	}
};

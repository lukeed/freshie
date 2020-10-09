exports.babel = function (config) {
	config.plugins = config.plugins || [];

	config.plugins.push(
		['@babel/plugin-transform-react-jsx', {
			pragmaFrag: 'Fragment',
			pragma: 'h',
		}]
	);
}

// TODO: options.ui.extension (for loaders/include)
exports.esbuild = function (config) {
	config.jsxFragment = 'Fragment';
	config.jsxFactory = 'h';
}

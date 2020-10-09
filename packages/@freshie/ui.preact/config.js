exports.babel = function (config) {
	config.plugins = config.plugins || [];

	config.plugins.push(
		['@babel/plugin-transform-react-jsx', {
			pragmaFrag: 'Fragment',
			pragma: 'h',
		}]
	);
}

// TODO: plugin.esbuild
// TODO: options.ui.extension (for route)
exports.esbuild = function (config) {
	config.jsxFactory = 'preact.h';
	config.jsxFragment = 'preact.Fragment';
}

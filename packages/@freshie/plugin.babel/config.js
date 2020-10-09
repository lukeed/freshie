const toArray = (x, y=[]) => x == null ? y : y.concat(x);

exports.babel = function (config) {
	config.babelrc = false;
	config.babelHelpers = 'bundled';
	config.presets = toArray(config.presets);
	config.exclude = toArray(config.exclude, ['node_modules/**']);
	config.plugins = toArray(config.plugins);
}

exports.rollup = function (config, options) {
	config.plugins.push(
		require('@rollup/plugin-babel').default(options.babel)
	);
}

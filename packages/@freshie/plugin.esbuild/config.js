exports.esbuild = function (config) {
	config.target = 'es2017';
	config.include = /\.[jt]sx?$/; // default - TODO: options.ui.extensions ?
	config.define = config.define || {};
}

exports.rollup = function (config, context, options) {
	Object.assign(options.esbuild.define, options.replace);

	config.plugins.push(
		require('rollup-plugin-esbuild')({
			...options.esbuild,
			minify: context.minify,
		})
	);
}

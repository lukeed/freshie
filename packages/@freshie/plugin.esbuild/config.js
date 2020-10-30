exports.esbuild = function (config, context) {
	config.define = config.define || {};
	config.include = /\.[jt]sx?$/; // default - TODO: options.ui.extensions ?
	config.target = context.ssr ? 'node12.18.0' : 'es2020';
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

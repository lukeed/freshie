exports.terser = function (config) {
	let { mangle=true, compress=true } = config;
	config.compress = compress;
	config.mangle = mangle;

	config.output = config.output || {};
	config.output.comments = !!config.output.comments;
}

exports.rollup = function (config, context, options) {
	if (context.isProd && context.minify) {
		config.plugins.push(
			require('.').terser(options.terser)
		);
	}
}

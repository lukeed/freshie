exports.typescript = function (config, context) {
	const override = config.tsconfigOverride || {};
	override.compilerOptions = override.compilerOptions || {};
	override.compilerOptions.watch = !context.isProd;
	config.tsconfigOverride = override;
}

exports.rollup = function (config, context, options) {
	config.plugins.push(
		require('rollup-plugin-typescript2')(options.typescript)
	);
}

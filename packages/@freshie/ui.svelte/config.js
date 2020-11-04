const { join } = require('path');

exports.alias = function (config) {
	config.entries['!!~error~!!'] = join(__dirname, '_error.svelte');
}

exports.templates = function (config) {
	config.test = /\.svelte$/;
}

exports.postcss = function (config) {
	config.modules = false;
}

exports.svelte = {
	emitCss: true,
	hydratable: true,
	// TODO: 7.0
	// compilerOptions: {
	// 	hydratable: true,
	// }
}

// TODO: load CWD/svelte.config.js values
exports.rollup = function (config, context, options) {
	/*
	TODO: 7.0
	const { compilerOptions } = options.svelte;

	compilerOptions.hydratable = true;
	compilerOptions.generate = context.ssr ? 'ssr' : 'dom';

	options.svelte.compilerOptions = compilerOptions;
	options.svelte.emitCss = true;
	*/

	options.svelte.generate = context.ssr ? 'ssr' : 'dom';

	config.plugins.push(
		require('rollup-plugin-svelte')(options.svelte)
	);
}

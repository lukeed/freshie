const { join } = require('path');

exports.alias = function (config) {
	config.entries['!!~error~!!'] = join(__dirname, '_error.svelte');
}

exports.templates = function (config) {
	config.test = /\.svelte$/;
}

exports.svelte = {
	hydratable: true,
}

// TODO: load CWD/svelte.config.js values
exports.rollup = function (config, context, options) {
	config.plugins.push(
		require('rollup-plugin-svelte')({
			css: context.ssr ? false : (css => css.write('index.css')),
			generate: context.ssr ? 'ssr' : 'dom',
			...options.svelte,
		})
	);
}

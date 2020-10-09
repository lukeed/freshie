exports.svelte = {
	hydratable: true,
	css: false,
}

// TODO: load CWD/svelte.config.js values
exports.rollup = function (config, options, context) {
	config.plugins.push(
		require('rollup-plugin-svelte')({
			generate: context.ssr ? 'ssr' : 'dom',
			...options.svelte,
		})
	);
}

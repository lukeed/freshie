exports.rollup = function (config, options, context) {
	config.plugins.push(
		// @ts-ignore
		require('rollup-plugin-svelte')({
			hydratable: true,
			generate: context.ssr ? 'ssr' : 'dom',
			css: false,
		})
	)
}

// TODO? include inside ui.svelte
exports.svelte = function (config) {
	// @ts-ignore - export default type
	config.preprocess = require('svelte-preprocess')()
}

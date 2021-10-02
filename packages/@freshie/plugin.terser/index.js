/** @type {import('terser').minify} */ let minify;

/**
 * @param {import('terser').MinifyOptions} [options]
 * @returns {import('rollup').Plugin}
 */
exports.terser = function (options) {
	return {
		name: 'terser',
		buildStart() {
			minify = minify || require('terser').minify;
		},
		async renderChunk(code, _chunk, config) {
			const { sourcemap, format } = config;

			const output = await minify(code, {
				module: /esm?/.test(format),
				sourceMap: !!sourcemap,
				toplevel: true,
				...options,
			});

			return {
				code: output.code,
				map: output.map
			};
		}
	}
};

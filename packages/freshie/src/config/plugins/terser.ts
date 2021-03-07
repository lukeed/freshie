import type { MinifyOptions } from 'terser';

export function Terser(options: MinifyOptions): Rollup.Plugin {
	let minify: typeof import('terser').minify;

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

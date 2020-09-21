const { transpileModule } = require('typescript');
const tsconfig = require('../tsconfig.json');
const { build } = require('./util');

const terser = require('rollup-plugin-terser').terser();
const resolve = require('@rollup/plugin-node-resolve').default({
	extensions: ['.ts', '.mjs', '.js', '.json']
});

const typescript = {
	name: 'typescript',
	transform(code, file) {
		if (!/\.ts$/.test(file)) return code;

		// @ts-ignore
		let output = transpileModule(code, {
			...tsconfig,
			fileName: file
		});

		return {
			code: output.outputText,
			map: output.sourceMapText || null
		};
	}
};

// ---

build('suave', {
	input: 'packages/suave/src/index.ts',
	interop: false,
	format: {
		cjs: 'build/index.js'
	},
	plugins: [
		resolve,
		typescript,
		// terser
	],
});

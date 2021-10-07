import { rollup } from 'rollup';
import * as terser from 'terser';
import { transform } from 'esbuild';
import { builtinModules } from 'module';
import { existsSync, statSync } from 'fs';
import { basename, dirname, extname, join } from 'path';
import * as utils from './utils';

import type { ModuleFormat, OutputOptions, OutputChunk, Plugin } from 'rollup';

const packages = join(utils.__dirname, '../packages');

function bail(message: string): never {
	console.error(message);
	process.exit(1);
}

type Mapping = {
	[input: string]: string | true;
}

type Exports = {
	require?: string;
	import?: string;
}

function toEntryName(file: string) {
	let extn = extname(file);
	let name = basename(file, extn);
	return name === 'index' ? '.' : `./${name}`;
}

function make(file: string, format: ModuleFormat): OutputOptions {
	return {
		file, format,
		freeze: false,
		esModule: false,
		interop: false,
		strict: false,
	};
}

// Rollup Plugin
const plugin: Plugin = {
	name: 'esbuild',
	resolveId(file, importer) {
		let tmp, ext = extname(file);
		if (ext) return file;

		file = join(dirname(importer!), file);

		if (existsSync(file)) {
			let stats = statSync(file);
			if (stats.isFile()) return file;
			file = join(file, 'index');
		}

		if (existsSync(tmp = file + '.ts')) return tmp;
		if (existsSync(tmp = file + '.js')) return tmp;

		return null;
	},
	transform(code, id) {
		return transform(code, {
			loader: 'ts',
			format: 'esm',
			sourcefile: id,
			target: 'es2019',
			sourcemap: 'external',
			logLevel: 'warning',
			treeShaking: true,
			charset: 'utf8',
			minify: true,
			define: {
				VERSION: '"1.2.3"' // todo
			}
		});
	},
	async renderChunk(code) {
		let output = await terser.minify(code, {
			mangle: true,
			compress: true,
			output: {
				comments: false,
			}
		});
		return {
			code: output.code!,
			map: output.map,
		};
	}
};

export async function bundle(modname: string, inputs: Mapping) {
	let pkgdir = join(packages, modname);
	let pkgfile = join(pkgdir, 'package.json');
	let pkg = await import(pkgfile);

	let externals = [
		pkg.name,
		...builtinModules,
		...Object.keys(pkg.dependencies||{}),
		...Object.keys(pkg.peerDependencies||{}),
	];

	let encoder = new TextEncoder;
	let outputs: utils.FileData[] = [];
	let hasExports = pkg.exports != null;
	let isESM = pkg.type === 'module';

	await Promise.all(
		Object.keys(inputs).sort().map(async function (rel) {
			let output = inputs[rel];
			let input = join(pkgdir, rel);
			existsSync(input) || bail(`Missing "${rel}" file!`);

			let entry: Exports = {};

			if (output === true) {
				hasExports || bail(`Missing "exports" in module: ${modname}`);

				let key = toEntryName(input);
				entry = pkg.exports[key];

				if (!entry) return bail(`Missing "exports" entry: ${key}`);
				if (typeof entry === 'string') {
					output = entry;
					entry = {};
				}
			}

			if (typeof output === 'string') {
				if (isESM && /\.m?js$/.test(output)) entry.import = output;
				else if (/\.mjs$/.test(output)) entry.import = output;
				else entry.require = output;
			}

			let bundle = await rollup({
				input: input,
				external: externals,
				plugins: [plugin],
				treeshake: true,
			});

			let chunks: OutputOptions[] = [];

			if (entry.require) {
				let outfile = join(pkgdir, entry.require);
				chunks.push(make(outfile, 'cjs'));
			}

			if (entry.import) {
				let outfile = join(pkgdir, entry.import);
				chunks.push(make(outfile, 'esm'));
			}

			let contents = await Promise.all(
				chunks.map(bundle.write)
			);

			// summary information
			for (let { output } of contents) {
				output.forEach(item => {
					if (item.type !== 'chunk') return;
					let buffer = encoder.encode(item.code);
					outputs.push(utils.inspect(item.fileName, buffer));
				});
			}
		})
	);

	// print summary
	utils.table(modname, pkgdir, outputs);
}

// TODO / TBD - maybe useful later
// @see lukeed/worktop

import { build } from 'esbuild';
import { builtinModules } from 'module';
import { existsSync, promises as fs } from 'fs';
import { dirname, join } from 'path';
import * as utils from './utils';

const packages = join(utils.__dirname, '../packages');

function bail(message: string): never {
	console.error(message);
	process.exit(1);
}

export async function bundle(modname: string, isMulti = true) {
	let pkgdir = join(packages, modname);
	let pkg = await import(join(pkgdir, 'package.json'));

	let files = await fs.readdir(
		join(pkgdir, 'src')
	);

	let externals = [
		pkg.name, ...builtinModules,
		...Object.keys(pkg.dependencies||{}),
		...Object.keys(pkg.peerDependencies||{}),
	];

	if (pkg.exports == null) {
		return bail(`Missing "exports" in module: ${modname}`);
	}

	let encoder = new TextEncoder;
	let outputs: utils.FileData[] = [];

	async function write(file: string, content: Uint8Array | string) {
		await fs.writeFile(file, content);
		if (typeof content === 'string') content = encoder.encode(content);
		outputs.push(utils.inspect(file, content));
	}

	let i=0, isTS=/\.ts$/, tasks=[];
	for (files.sort(); i < files.length; i++) {
		let dts: string;
		let file = files[i];
		if (!isTS.test(file)) continue;
		if (file == 'node_modules') continue;
		if (/\.(test|d)\.ts$/.test(file)) continue;

		if (isMulti) {
			dts = file.replace(isTS, '.d.ts');
			files.includes(dts) || bail(`Missing "${dts}" file!`);
		}

		let key = file === 'index.ts' ? '.' : `./${file.replace(isTS, '')}`;

		let entry = pkg.exports[key];
		if (!entry) return bail(`Missing "exports" entry: ${key}`);
		if (!entry.import) return bail(`Missing "import" condition: ${key}`);
		if (!entry.require) return bail(`Missing "require" condition: ${key}`);

		tasks.push(async function () {
			let input = join(pkgdir, 'src', file);
			let output = join(pkgdir, entry.import);

			// build ts -> esm
			let esm = await build({
				bundle: true,
				format: 'esm',
				sourcemap: false,
				entryPoints: [input],
				external: externals,
				outfile: output,
				target: 'es2019',
				treeShaking: true,
				logLevel: 'warning',
				minifyIdentifiers: true,
				minifySyntax: true,
				charset: 'utf8',
				write: false,
			}).then(bundle => {
				return bundle.outputFiles[0];
			});

			let outdir = dirname(esm.path);

			// purge existing directory
			if (isMulti && existsSync(outdir)) {
				await fs.rm(outdir, {
					recursive: true,
					force: true,
				});
			}

			// create dir (safe writes)
			if (isMulti) await fs.mkdir(outdir);
			await write(esm.path, esm.contents);

			// convert esm -> cjs
			// output = join(pkgdir, entry.require);
			// await write(output, utils.rewrite(esm.text));

			if (isMulti) {
				// foo.d.ts -> foo/index.d.ts
				input = join(pkgdir, 'src', dts!);
				await write(
					join(outdir, 'index.d.ts'),
					await fs.readFile(input)
				);
			}
		}());
	}

	await Promise.all(tasks);
	utils.table(modname, pkgdir, outputs);
}

// import klona from 'klona';
// import colors from 'kleur';
import { existsSync } from 'fs';
import { premove } from 'premove';
import { normalize } from '../utils/argv';
import * as log from '../utils/log';
import { load } from '../config';

async function bundle(rollup: typeof import('rollup').rollup, configs: Config.Group) {
	const bun = await rollup(config);
	// TODO: generate dom + ssr at same time?
	await Promise.all([].concat(config.output).map(bun.write));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: true });

	const config = await load(argv as Argv.Options).catch(err => {
		log.bail(err.message);
	});

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	const { rollup } = require('rollup');

	const start = Date.now();
	await bundle(rollup, config);
	console.log(`~> (${Date.now() - start}ms)`);
}

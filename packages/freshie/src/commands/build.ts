// import klona from 'klona';
// import colors from 'kleur';
import { existsSync } from 'fs';
import { premove } from 'premove';
import * as Config from '../config';
import { normalize } from '../utils/argv';
import * as log from '../utils/log';

async function bundle(rollup: typeof import('rollup').rollup, config: Rollup.Config) {
	const bun = await rollup(config);
	// TODO: generate dom + ssr at same time?
	await Promise.all([].concat(config.output).map(bun.write));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: true });

	const config = await Config.load(argv as Argv.Options).catch(err => {
		log.bail(err.message);
	});

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	const { rollup } = require('rollup');

	const start = Date.now();
	await bundle(rollup, config.client);
	console.log(`~> (${Date.now() - start}ms)`);
}

import { existsSync } from 'fs';
import { premove } from 'premove';
import { normalize } from '../../utils/argv';
import * as log from '../../utils/log';
import { load } from '../../config';
import Watcher from './watcher';

async function bundle(rollup: typeof import('rollup').rollup, config: Rollup.Config) {
	const bun = await rollup(config);
	// TODO: generate dom + ssr at same time?
	await Promise.all([].concat(config.output).map(bun.write));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: false });

	const config = await load(argv as Argv.Options).catch(err => {
		log.bail(err.message);
	});

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	Watcher(config.client, argv as Argv.Options);
}

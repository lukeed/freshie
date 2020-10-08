// import klona from 'klona';
// import colors from 'kleur';
import { existsSync } from 'fs';
import { premove } from 'premove';
import { normalize } from '../utils/argv';
import * as log from '../utils/log';
import { load } from '../config';

async function compile(rollup: typeof import('rollup').rollup, config: Config.Rollup): Promise<Rollup.Output> {
	return rollup(config).then(b => b.write(config.output));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: true });

	const config = await load(argv as Argv.Options).catch(log.bail);

	if (existsSync(argv.dest)) {
		log.warn(`Removing "${ log.$dir(argv.destDir) }" directory`);
		await premove(argv.dest);
	}

	const { rollup } = require('rollup');

	// TODO: Add Manifest | HTML to Client
	await compile(rollup, config.client);
	if (config.server) await compile(rollup, config.server);
	log.success('Build complete! 🎉');
}

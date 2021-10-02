import { normalize } from '../utils/argv';
import * as log from '../utils/log';
import * as fs from '../utils/fs';
import { load } from '../config';

import type { Argv, Rollup } from '../internal';
import type { Config } from 'freshie';

async function compile(rollup: typeof import('rollup').rollup, config: Config.Rollup): Promise<Rollup.Output> {
	return rollup(config).then(b => b.write(config.output));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	try {
		normalize(src, argv, { isProd: true });

		const config = await load(argv as Argv.Options).catch(log.bail);

		if (fs.exists(argv.dest)) {
			log.warn(`Removing "${ log.$dir(argv.destDir) }" directory`);
			await fs.remove(argv.dest);
		}

		const { rollup } = require('rollup');

		// TODO: Add Manifest | HTML to Client
		await compile(rollup, config.client);
		if (config.server) await compile(rollup, config.server);
		log.success('Build complete! 🎉');
	} catch (err) {
		log.bail(err);
	}
}

import { normalize } from '../utils/argv';
import * as log from '../utils/log';
import * as fs from '../utils/fs';
import { load } from '../config';

import type { Argv, Rollup } from '../internal';
import type { Config } from 'freshie';

let rollup: typeof import('rollup').rollup;

async function compile(config: Config.Rollup): Promise<Rollup.Output> {
	rollup = rollup || require('rollup').rollup;
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

		// TODO: Add Manifest | HTML to Client
		await compile(config.client);
		if (config.server) await compile(config.server);
		log.success('Build complete! 🎉');
	} catch (err) {
		log.bail(err);
	}
}

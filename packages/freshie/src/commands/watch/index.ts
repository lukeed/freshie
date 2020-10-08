import { existsSync } from 'fs';
import { premove } from 'premove';
import { normalize } from '../../utils/argv';
import * as log from '../../utils/log';
import { load } from '../../config';
import Watcher from './watcher';

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: false });

	const config = await load(argv as Argv.Options).catch(log.bail);

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	Watcher(config.client, argv as Argv.Options);
}

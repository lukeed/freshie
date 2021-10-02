import { normalize } from '../../utils/argv';
import * as log from '../../utils/log';
import * as fs from '../../utils/fs';
import { load } from '../../config';
import Watcher from './watcher';

import type { Argv } from '../../internal';

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: false });

	const config = await load(argv as Argv.Options).catch(log.bail);

	if (fs.exists(argv.dest)) {
		log.warn(`Removing "${ log.$dir(argv.destDir) }" directory`);
		await fs.remove(argv.dest);
	}

	Watcher(config.client, argv as Argv.Options);
}

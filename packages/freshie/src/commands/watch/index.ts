import { normalize } from '../../utils/argv';
import * as log from '../../utils/log';
import * as fs from '../../utils/fs';
import { load } from '../../config';
import Watcher from './watcher';
import Server from './server';

// TODO: client runtime injection(s)
export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: false });

	const config = await load(argv as Argv.Watch).catch(log.bail);

	if (fs.exists(argv.dest)) {
		log.warn(`Removing "${ log.$dir(argv.destDir) }" directory`);
		await fs.remove(argv.dest);
	}

	// TODO: `pwa-cli|sirv` key|(ca)cert stuff
	const server = await Server(argv.dest, argv as Argv.Watch, {
		single: true
	});

	Watcher(config.client, argv as Argv.Watch, {
		onError: msg => server.broadcast('error', msg),
		onUpdate: arr => server.broadcast('update', JSON.stringify(arr)),
	});
}

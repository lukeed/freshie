// import klona from 'klona';
// import colors from 'kleur';
import { existsSync } from 'fs';
import { premove } from 'premove';
import * as Config from '../config';
import { normalize } from '../utils/argv';
import * as utils from '../utils/index';
// import * as log from '../log';

import { Runtime } from '../config/plugins/runtime';

async function bundle(rollup: typeof import('rollup').rollup, config: Rollup.Config) {
	const bun = await rollup(config);
	// TODO: generate dom + ssr at same time?
	await Promise.all([].concat(config.output).map(bun.write));
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: true });

	const config = Config.load(argv as Argv.Options);

	const routes = await utils.routes(argv.src, 'routes'); // TODO: options.routes object
	if (!routes.length) return console.log('No routes found!');

	console.log('ROUTES', routes);

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	const { rollup } = require('rollup');

	// TODO: add Runtime inside Config?
	config.client.plugins.push(
		Runtime(routes, true)
	);

	const start = Date.now();
	await bundle(rollup, config.client);
	console.log(`~> (${Date.now() - start}ms)`);
}

// import klona from 'klona';
// import colors from 'kleur';
import { existsSync } from 'fs';
import { premove } from 'premove';
import * as Config from '../config';
import { normalize } from '../utils/argv';
import * as utils from '../utils/index';
// import * as log from '../log';

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

	// TODO: isDOM
	// const isDOM = true;
	// config.plugins.push();

	const start = Date.now();
	await rollup(config).then((bun: Rollup.Bundle) => {
		return bun.write(config.output);
	});

	console.log(`~> (${Date.now() - start}ms)`);
}

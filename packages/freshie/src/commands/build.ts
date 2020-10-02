// import klona from 'klona';
// import colors from 'kleur';
import { join } from 'path';
import { existsSync } from 'fs';
import { premove } from 'premove';
// import * as defaults from '../config';
import { normalize } from '../utils/argv';
import * as utils from '../utils/index';
// import * as log from '../log';

const RUNTIME = join(__dirname, '..', 'runtime');

async function xform(routes: Build.Route[], isDOM: boolean): Promise<string> {
	const entry = join(RUNTIME, isDOM ? 'dom.js' : 'ssr.js');
	const fdata = await utils.read(entry, 'utf8');

	// TODO: layout files
	let imports='', defines='';
	routes.forEach(tmp => {
		if (defines) defines += '\n\t';
		if (isDOM) {
			defines += `define('${tmp.pattern}', () => import('${tmp.file}'));`;
		} else {
			imports += `import * as ${tmp.name/*TODO*/} from '${tmp.file}';\n`;
			defines += `define('${tmp.pattern}', ${tmp.name/*TODO*/});`
		}
	});

	if (imports) imports += '\n';
	return imports + fdata.replace('/* <ROUTES> */', defines);
}

export default async function (src: Nullable<string>, argv: Partial<Argv.Options>) {
	normalize(src, argv, { isProd: true });

	const routes = await utils.routes(argv.src, 'routes'); // TODO: options.routes object
	if (!routes.length) return console.log('No routes found!');

	console.log('ROUTES', routes);

	if (existsSync(argv.dest)) {
		console.warn(`Removing "${argv.destDir}" directory`);
		await premove(argv.dest);
	}

	const { rollup } = require('rollup');

	// TODO: isDOM
	const isDOM = true;
	config.plugins.push({
		name: 'freshie/runtime',
		resolveId: (id) => id === 'freshie/runtime' ? id : null,
		load: (id) => id === 'freshie/runtime' ? xform(routes, isDOM) : null
	});

	const start = Date.now();
	await rollup(config).then((bun: Rollup.Bundle) => {
		return bun.write(config.output);
	});

	console.log(`~> (${Date.now() - start}ms)`);
}

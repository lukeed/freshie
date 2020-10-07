import { join } from 'path';
import * as utils from '../../utils';

const RUNTIME = join(__dirname, '..', 'runtime');

async function xform(routes: Build.Route[], isDOM: boolean): Promise<string> {
	const entry = join(RUNTIME, isDOM ? 'dom.js' : 'ssr.js');
	const fdata = await utils.read(entry, 'utf8');

	// TODO: layout files
	let imports='', defines='';
	routes.forEach((tmp, idx) => {
		if (defines) defines += '\n\t';
		if (isDOM) {
			defines += `define('${tmp.pattern}', () => import('${tmp.file}'));`;
		} else {
			imports += `import * as $Route${idx} from '${tmp.file}';\n`;
			defines += `define('${tmp.pattern}', $Route${idx});`
		}
	});

	if (imports) imports += '\n';
	return imports + fdata.replace('/* <ROUTES> */', defines);
}

export function Runtime(routes: Build.Route[], isDOM: boolean): Rollup.Plugin {
	return {
		name: 'freshie/runtime',
		resolveId: (id) => id === 'freshie/runtime' ? id : null,
		load: (id) => id === 'freshie/runtime' ? xform(routes, isDOM) : null,
	};
}

import { join } from 'path';
import * as utils from '../../utils';

const RUNTIME = join(__dirname, '..', 'runtime', 'index.dom.js');

async function xform(file: string, routes: Build.Route[], isDOM: boolean): Promise<string> {
	let fdata = await utils.read(file, 'utf8');

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
	const ident = 'freshie/runtime';

	const Plugin: Rollup.Plugin = {
		name: 'plugins/runtime',
		load: id => {
			if (id === ident) return xform(RUNTIME, routes, isDOM);
			if (/[\\\/]+@freshie\/ssr/.test(id)) return xform(id, routes, isDOM);
		}
	};

	if (isDOM) {
		Plugin.resolveId = id => id === ident ? id : null;
	}

	return Plugin;
}

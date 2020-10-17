import { join } from 'path';
import * as fs from '../../utils/fs';

const RUNTIME = join(__dirname, '..', 'runtime', 'index.dom.js');

async function xform(file: string, routes: Build.Route[], errors: Build.Error[], isDOM: boolean): Promise<string> {
	const fdata = await fs.read(file, 'utf8');
	const Layouts: Map<string, string> = new Map;
	let count=0, imports='', $routes='', $errors='';

	function to_layout(file: string | void): string | void {
		let local = file && Layouts.get(file);
		if (file && local) return local;
		if (file && !local) {
			Layouts.set(file, local = `$Layout${count++}`);
			imports += `import * as ${local} from '${file}';\n`;
			return local;
		}
	}

	// TODO: multiple layout nesting
	routes.forEach((tmp, idx) => {
		if ($routes) $routes += '\n\t';

		if (isDOM) {
			let views = [`import('${tmp.file}')`];
			if (tmp.layout) views.unshift(`import('${tmp.layout}')`);
			$routes += `define('${tmp.pattern}', () => Promise.all([ ${views} ]));`;
		} else {
			let views = [`$Route${idx}`];
			let layout = to_layout(tmp.layout);
			if (layout) views.unshift(layout);
			imports += `import * as $Route${idx} from '${tmp.file}';\n`;
			$routes += `define('${tmp.pattern}', ${views});`;
		}
	});

	errors.forEach((tmp, idx) => {
		if (isDOM) {
			let views = [`import('${tmp.file}')`];
			if (tmp.layout) views.unshift(`import('${tmp.layout}')`);
			$errors += `'${tmp.key}': () => Promise.all([ ${views} ]),`;
		} else {
			let views = [`$Error${idx}`];
			let layout = to_layout(tmp.layout);
			if (layout) views.unshift(layout);
			imports += `import * as $Error${idx} from '${tmp.file}';\n`;
			$errors += `'${tmp.key}': prepare([${views}]),`;
		}
	});

	if (imports) imports += '\n';
	return imports + fdata.replace('/* <ROUTES> */', $routes).replace('/* <ERRORS> */', $errors);
}

export function Runtime(routes: Build.Route[], errors: Build.Error[], isDOM: boolean): Rollup.Plugin {
	const ident = 'freshie/runtime';

	const Plugin: Rollup.Plugin = {
		name: 'plugins/runtime',
		load: id => {
			if (id === ident) return xform(RUNTIME, routes, errors, isDOM);
			if (/[\\\/]+@freshie\/ssr/.test(id)) return xform(id, routes, errors, isDOM);
		}
	};

	if (isDOM) {
		Plugin.resolveId = id => id === ident ? id : null;
	}

	return Plugin;
}

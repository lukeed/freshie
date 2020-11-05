import { join } from 'path';

const DIR_HTTP = join(__dirname, '..', 'http', 'index.mjs');
const DIR_ROUTER = join(__dirname, '..', 'router', 'index.mjs');

export const Router: Rollup.Plugin = {
	name: 'plugins/router',
	resolveId: (id) => id === 'freshie/router' ? DIR_ROUTER : null,
}

export const HTTP: Rollup.Plugin = {
	name: 'plugins/http',
	resolveId: (id) => id === 'freshie/http' ? DIR_HTTP : null,
}

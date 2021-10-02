import { join } from 'path';

import type { Rollup } from '../../internal';

const DIR_ENV = join(__dirname, '..', 'env', 'index.mjs');
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

export const ENV: Rollup.Plugin = {
	name: 'plugins/env',
	resolveId: (id) => id === 'freshie/env' ? DIR_ENV : null,
}

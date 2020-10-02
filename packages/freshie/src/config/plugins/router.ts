import { join } from 'path';

const ROUTER = join(__dirname, '..', 'router', 'index.mjs');

export const Router: Rollup.Plugin = {
	name: 'freshie/router',
	resolveId: (id) => id === 'freshie/router' ? ROUTER : null,
}

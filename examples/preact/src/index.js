import * as freshie from 'freshie/runtime';
import * as svelte from '@freshie/preact';

freshie.start({
	base: '/',
	target: document.body,
	hydrate: svelte.hydrate,
	render: svelte.render,
});

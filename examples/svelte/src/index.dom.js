import * as freshie from 'freshie/runtime';
import * as svelte from '@freshie/ui.svelte';

freshie.start({
	base: '/',
	target: document.body,
	hydrate: svelte.hydrate,
	render: svelte.render,
});

import * as suave from 'suave/runtime';
import * as svelte from '@suave/svelte';

suave.start({
	base: '/',
	target: document.body,
	hydrate: svelte.hydrate,
	render: svelte.render,
});

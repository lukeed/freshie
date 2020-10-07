import * as freshie from '@freshie/ssr.node';
import * as svelte from '@freshie/ui.svelte';

freshie.start({
	render: svelte.ssr,
	port: 8080
});

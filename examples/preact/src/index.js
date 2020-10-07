import * as freshie from 'freshie/runtime';
import * as preact from '@freshie/ui.preact';

freshie.start({
	base: '/',
	target: document.body,
	hydrate: preact.hydrate,
	render: preact.render,
});

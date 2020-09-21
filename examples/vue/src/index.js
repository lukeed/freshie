import * as suave from 'suave/runtime';
import * as vue from '@suave/vue';

suave.start({
	base: '/',
	target: document.body,
	hydrate: vue.hydrate,
	render: vue.render,
});

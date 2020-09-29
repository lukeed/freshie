import * as freshie from 'freshie/runtime';
import * as vue from '@freshie/ui.vue';

freshie.start({
	base: '/',
	target: document.body,
	hydrate: vue.hydrate,
	render: vue.render,
});

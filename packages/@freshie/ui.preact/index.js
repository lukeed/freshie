import * as preact from 'preact';

export function render(Tags, props, target) {
	preact.render(layout(Tags, props), target);
}

export function hydrate(Tags, props, target) {
	preact.hydrate(layout(Tags, props), target);
}

export function layout(Tags, props={}) {
	let len=Tags.length, vnode;
	while (len-- > 0) vnode = preact.h(Tags[len], props, vnode);
	return vnode;
}

// ---

import toHTML from 'preact-render-to-string';

export function ssr(Tags, props={}) {
	let vnode = layout(Tags, props);
	let body = toHTML(vnode) || '';
	return { head: '', body };
}

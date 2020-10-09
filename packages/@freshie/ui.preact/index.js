import * as preact from 'preact';

var root;
export function render(Tag, props, target) {
	root = preact.render(preact.h(Tag, props), target, root);
}

export function hydrate(Tag, props, target) {
	root = preact.hydrate(preact.h(Tag, props), target, root);
}

export function layout(Tags, props={}) {
	let len=Tags.length, vnode;
	while (len-- > 0) vnode = preact.h(Tags[len], props, vnode);
	return vnode;
}

// ---

import toHTML from 'preact-render-to-string';

export function ssr(vnode) {
	let body = toHTML(vnode) || '';
	return { head: '', body };
}

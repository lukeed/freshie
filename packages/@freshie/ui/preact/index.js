import * as preact from 'preact';

var root;
export function render(Tag, props, target) {
	root = preact.render(preact.h(Tag, props), target, root);
}

export function hydrate(Tag, props, target) {
	root = preact.hydrate(preact.h(Tag, props), target, root);
}

// ---

import toHTML from 'preact-render-to-string';

export function ssr(Tag, props={}) {
	let vnode = preact.h(Tag, props);
	let body = toHTML(vnode) || '';
	return { head: '', body };
}

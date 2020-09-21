import * as preact from 'preact';

var root;
export function render(Tag, props, target) {
	root = preact.render(preact.h(Tag, props), target, root);
}

export function hydrate(Tag, props, target) {
	root = preact.hydrate(preact.h(Tag, props), target, root);
}

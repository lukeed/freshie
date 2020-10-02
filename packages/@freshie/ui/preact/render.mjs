import { h } from 'preact';
import toHTML from 'preact-render-to-string';

export function render(Tag, props={}) {
	let vnode = h(Tag, props);
	let body = toHTML(vnode) || '';
	return { head: '', body };
}

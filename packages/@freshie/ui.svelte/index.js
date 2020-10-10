var App;

export function render(Tag, props, target) {
	if (App) App.$destroy();
	App = new Tag({ props, target });
}

export function hydrate(Tag, props, target) {
	App = new Tag({ props, target, hydrate: true });
}

// ---

// ---

import { create_ssr_component } from 'svelte/internal';

export function ssr(Tags, props={}) {
	let head='', body='', len=Tags.length;

	if (len > 0) {
		let ssr = create_ssr_component(($$out, $$props, $$bindings) => {
			let slots={};
		while (len-- > 1) {
				let tmp = Tags[len];
			// NOTE: you can ONLY use <slot/> in layouts
				slots = { default: ($$p) => tmp.$$render($$out, $$p, $$bindings, slots) };
		}
			return Tags[0].$$render($$out, {}, {}, slots);
		}).render(props);

		body += ssr.html;
		head += ssr.head || '';
		if (ssr.css && ssr.css.code) {
			head += `<style>${ssr.css.code}</style>`;
		}
	}

	return { head, body };
}

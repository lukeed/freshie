var App;

export function render(Tags, props, target) {
	if (App) App.$destroy();
	var Tag = layout(Tags, props);
	App = Tag({ props, target });
}

export function hydrate(Tags, props, target) {
	var Tag = layout(Tags, props);
	App = Tag({ props, target, hydrate: true });
}

// ---

// ---

import { detach, insert, noop, SvelteComponent } from 'svelte/internal';

function slotty(elem) {
	return function () {
		var t, frag={};
		if (elem instanceof SvelteComponent) t = elem;
		else if (typeof elem === 'function') t = new elem({ $$inline: true });
		frag = t && t.$$ && t.$$.fragment || frag;

		frag.c = frag.c || noop;
		frag.l = frag.l || noop;

		frag.m = frag.m || function (target, anchor) {
			insert(target, elem, anchor);
		}

		frag.d = frag.d || function (detaching) {
			if (detaching) detach(t || elem);
		};

		return frag;
	};
}

function bury(props, prev) {
	return {
		...props,
		$$scope: {},
		$$slots: {
			default: [ slotty(prev) ]
		}
	};
}

export function layout(Tags, props={}) {
	var len=Tags.length, last, Tag=Tags[0];
	while (len-- > 1) {
		last = new Tags[len]({
			props: last ? bury(props, last) : props,
			$$inline: true,
		});
	}
	return function (opts={}) {
		if (last && opts.props) {
			opts.props = bury(props, last);
		}
		return new Tag(opts);
	}
}

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
				slots = { default: () => tmp.$$render($$out, $$props, $$bindings, slots) };
			}
			return Tags[0].$$render($$out, $$props, $$bindings, slots);
		}).render(props);

		body += ssr.html;
		head += ssr.head || '';
		if (ssr.css && ssr.css.code) {
			head += `<style>${ssr.css.code}</style>`;
		}
	}

	return { head, body };
}

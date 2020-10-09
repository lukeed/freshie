var App;

export function render(Tag, props, target) {
	if (App) App.$destroy();
	App = new Tag({ props, target });
}

export function hydrate(Tag, props, target) {
	App = new Tag({ props, target, hydrate: true });
}

// ---

export function ssr(Tags, props={}) {
	let head='', body='';
	let slots, len=Tags.length;

	if (len > 0) {
		while (len-- > 1) {
			// NOTE: you can ONLY use <slot/> in layouts
			slots = { default: () => Tags[len].render(props, slots) };
		}

		let ssr = Tags[0].render(props, slots);

		body += ssr.html;
		head += ssr.head || '';
		if (ssr.css && ssr.css.code) {
			head += `<style>${ssr.css.code}</style>`;
		}
	}

	return { head, body };
}

var App;

export function render(Tag, props, target) {
	if (App) App.$destroy();
	App = new Tag({ props, target });
}

export function hydrate(Tag, props, target) {
	App = new Tag({ props, target, hydrate: true });
}

// ---

export function ssr(Tag, props={}) {
	let { head='', html='', css } = Tag.render(props);
	if (css && css.code) head += `<style>${css.code}</style>`;
	return { head, body: html };
}

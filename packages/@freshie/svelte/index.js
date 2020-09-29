var App;

export function render(Tag, props, target) {
	if (App) App.$destroy();
	App = new Tag({ props, target });
}

export function hydrate(Tag, props, target) {
	App = new Tag({ props, target, hydrate: true });
}

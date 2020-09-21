import Vue from 'vue';

var root, Route;
export function render(Tag, props, target) {
	if (root) {
		root.$destroy();
		target.removeChild(root.$el);
	}

	Route = Vue.extend(Tag);
	root = new Route({ propsData: props }).$mount();
	target.appendChild(root.$el);
}

// TODO: $mount(target, true)
export function hydrate(Tag, props, target) {
	Route = Vue.extend(Tag);
	root = new Route({ propsData: props }).$mount();
	target.appendChild(root.$el);
}

import Router from 'freshie/router';

export var router;
var target, render, hydrate;

// var hasSW = ('serviceWorker' in navigator);
// var root = document.body;

function toRequest(params) {
	var { pathname, search } = location;
	var USP = new URLSearchParams(search);
	var query = Object.fromEntries(USP);
	return { pathname, search, query, params };
}

function define(pattern, importer) {
	// let files = [];
	let toFiles = Promise.resolve();

	// if (!hasSW && window.__rmanifest) {
	// 	if (files = window.__rmanifest[pattern]) {
	// 		// console.log('~> files', pattern, files);
	// 		toFiles = Promise.all(files.map(preload));
	// 	}
	// }

	router.on(pattern, (params) => {
		Promise.all([
			importer(), //=> Component
			toFiles, //=> Assets
		]).then(arr => {
			var req, m=arr[0], draw=hydrate||render;
			params = params || {};
			hydrate = false;
			if (m.preload) {
				req = toRequest(params);
				m.preload(req).then(props => {
					props = props || {};
					props.params = params;
					draw(m.default, props, target);
				});
			} else {
				draw(m.default, { params }, target);
			}
		});
	});
}

export function start(options) {
	options = options || {};

	render = options.render;
	hydrate = options.hydrate || render;
	// TODO: options.target
	target = document.body;


	// TODO: default 404 handler?
	router = Router(options.base || '/');
	/* <ROUTES> */

	// INIT
	if (document.readyState !== 'loading') router.listen();
	else addEventListener('DOMContentLoaded', router.listen);
}

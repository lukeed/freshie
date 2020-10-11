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

// TODO: accept multiple layouts
// TODO: attach manifest/files loader
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
			importer(), //=> Components
			toFiles, //=> Assets
		]).then(arr => {
			var tags=arr[0], draw=hydrate||render;
			var i=0, req, ctx, loaders=[], views=[];
			params = params || {};
			hydrate = false;

			for (; i < tags.length; i++) {
				views.push(tags[i].default);
				if (tags[i].preload) loaders.push(tags[i].preload);
			}

			if (loaders.length) {
				ctx = { ssr: false };
				req = toRequest(params);
				Promise.all(
					loaders.map(f => f(req, ctx))
				).then(list => {
					var props = { params };
					Object.assign(props, ...list);
					draw(views, props, target);
				});
			} else {
				draw(views, { params }, target);
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

import Router from 'freshie/router';

export var router;
var target, render, hydrate;

// var hasSW = ('serviceWorker' in navigator);
// var root = document.body;

function request(params) {
	var { pathname, search } = location;
	var USP = new URLSearchParams(search);
	var query = Object.fromEntries(USP);
	return { pathname, search, query, params };
}

function context(extra) {
	return { ...extra, ssr: false, dev: __DEV__ };
}

function run(Tags, params, ctx, req) {
	params = params || {};
	ctx = ctx || context();
	var draw = hydrate || render;
	var i=0, loaders=[], views=[];
	var props = { params };
	hydrate = false;

	for (; i < Tags.length; i++) {
		views.push(Tags[i].default);
		if (Tags[i].preload) loaders.push(Tags[i].preload);
	}

	if (loaders.length) {
		req = req || request(params);
		Promise.all(
			loaders.map(f => f(req, ctx))
		).then(list => {
			Object.assign(props, ...list);
			draw(views, props, target);
		});
	} else {
		draw(views, props, target);
	}
}

function ErrorPage(params, ctx) {
	import('!!~error~!!').then(m => {
		run([m], params, ctx);
	});
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
		var ctx = context();

		Promise.all([
			importer(), //=> Components
			toFiles, //=> Assets
		]).then(arr => {
			run(arr[0], params, ctx);
		}).catch(err => {
			ctx.error = err;
			ErrorPage(params, ctx);
		})
	});
}

function is404(url) {
	var ctx = context({ status: 404 });
	ErrorPage({ url }, ctx);
}

export function start(options) {
	options = options || {};

	render = options.render;
	hydrate = options.hydrate || render;
	// TODO: options.target
	target = document.body;


	router = Router(options.base || '/', is404);
	/* <ROUTES> */

	// INIT
	if (document.readyState !== 'loading') router.listen();
	else addEventListener('DOMContentLoaded', router.listen);
}

import sirv from 'sirv';
import { join } from 'path';
import parse from '@polka/url';
import regexparam from 'regexparam';
import { createServer } from 'http';
import * as ErrorPage from '!!~error~!!';
import { HTML } from '!!~html~!!';

const Tree = new Map;

// NOTE: ideally `layout` here
function define(route, ...Tags) {
	let i=0, tmp, loaders=[], views=[];
	let { keys, pattern } = regexparam(route);

	for (; i < Tags.length; i++) {
		tmp = Tags[i];
		views.push(tmp.default);
		if (tmp.preload) loaders.push(tmp.preload);
	}

	Tree.set(pattern, { keys, loaders, views });
}

function toError(status, message='') {
	const error = new Error(message);
	error.status = status;
	throw error;
}

function find(pathname) {
	let rgx, data, match;
	let j=0, arr, params={};
	for ([rgx, data] of Tree) {
		arr = data.keys;
		if (arr.length > 0) {
			match = pathname.match(rgx);
			if (match === null) continue;
			for (j=0; j < arr.length;) params[arr[j]]=match[++j];
			return { params, loaders:data.loaders, views:data.views };
		} else if (rgx.test(pathname)) {
			return { params, loaders:data.loaders, views:data.views };
		}
	}
}

export function setup() {
	/* <ROUTES> */
	return Tree;
}

// TODO: file server (sirv)
// TODO: tie `sirv` existence to `options.ssr.*` thing
export function start(options={}) {
	const { decode, port, render } = options;
	setup(); //=> attach app routes

	const assets = true && sirv(
		join(__dirname, '..', 'client'),
		{ dev: __DEV__ } // all from options.ssr?
	);

	return createServer(async (req, res) => {
		let props={ url: req.url }, page={};
		let route, isAsset, request=parse(req, decode);
		let context = { status: 0, ssr: true, dev: __DEV__ };
		context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

		request.query = request.query || {};
		request.headers = req.headers;
		request.params = {};

		try {
			if (req.method !== 'GET' && req.method !== 'HEAD') {
				return toError(405);
			}

			route = find(request.pathname);
			if (!route && !assets) return toError(404);
			if (isAsset = !route) return assets(req, res, () => {
				return (isAsset=false,toError(404));
			});

			request.params = route.params;

			if (route.loaders.length > 0) {
				await Promise.all(
					route.loaders.map(p => p(request, context))
				).then(list => {
					// TODO? deep merge props
					Object.assign(props, ...list);
				});
			}

			page = await render(route.views, props);
		} catch (err) {
			context.error = err;
			let next = { url: req.url };
			context.status = context.status || err.statusCode || err.status || 500;
			if (ErrorPage.preload) Object.assign(next, await ErrorPage.preload(request, context));
			page = await render([ErrorPage.default], next);
		} finally {
			if (isAsset) return; // handled
			// props.head=head; props.body=body;
			// TODO: static HTML vs HTML component file
			res.writeHead(context.status || 200, context.headers);
			let output = HTML.replace(/<\/body>/, page.body + '</body>');
			res.end(page.head ? output.replace(/<\/head>/, page.head + '</head>') : output);
		}
	}).listen(port);
}

// TODO: allow file server option ??
export function middleware(options={}) {
	const { decode } = options;
	setup(); //=> attach app routes
	return function (req, res, next) {
		let info, route, method=req.method;
		if (method !== 'GET' && method !== 'HEAD') {
			return next(); // user handles it
		}

		info = parse(req, decode);
		route = find(info.pathname);
		if (!route) return next(); // user

		// ...
	};
}

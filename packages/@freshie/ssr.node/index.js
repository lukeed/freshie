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
		{ dev: true, single: true } // all from options.ssr?
	);

	return createServer(async (req, res) => {
		let info, route, method=req.method;
		if (method !== 'GET' && method !== 'HEAD') {
			// TODO: error page
			res.statusCode = 405;
			return res.end();
		}

		info = parse(req, decode);
		route = find(info.pathname);
		if (!route && assets) return assets(req, res); // TODO: error page 404
		if (!route) return (res.statusCode=404,res.end()); // TODO: error page

		info.params = route.params;
		info.query = info.query || {};
		info.headers = req.headers;

		let props={ url: req.url }, head='', body='';
		let context = { status: 0, ssr: true, dev: __DEV__ };
		context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

		try {
			if (route.loaders.length > 0) {
				await Promise.all(
					route.loaders.map(p => p(info, context))
				).then(list => {
					// TODO? deep merge props
					Object.assign(props, ...list);
				});
			}

			({ head, body } = await render(route.views, props));
		} catch (err) {
			let nxt = {};
			context.error = err;
			context.status = context.status || err.status || 500;
			if (ErrorPage.preload) Object.assign(nxt, await ErrorPage.preload(info, context));
			({ head, body } = await render([ErrorPage.default], nxt));
		} finally {
			res.writeHead(context.status || 200, context.headers);
			// props.head=head; props.body=body;
			// TODO: react to static HTML vs HTML component
			let output = HTML.replace(/<\/body>/, body + '</body>');
			res.end(head ? output.replace(/<\/head>/, head + '</head>') : output);
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

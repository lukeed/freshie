import sirv from 'sirv';
import { join } from 'path';
import { resolve } from 'url';
import parse from '@polka/url';
import regexparam from 'regexparam';
import { createServer } from 'http';
import { HTML } from '!!~html~!!';

const Tree = new Map;
const ERRORS = { /* <ERRORS> */ };

function prepare(Tags, extra={}) {
	let i=0, tmp, loaders=[], views=[];
	for (; i < Tags.length; i++) {
		tmp = Tags[i];
		views.push(tmp.default);
		if (tmp.preload) loaders.push(tmp.preload);
	}
	return { ...extra, loaders, views };
}

// NOTE: ideally `layout` here
function define(route, ...Tags) {
	let { keys, pattern } = regexparam(route);
	let entry = prepare(Tags, { keys });
	Tree.set(pattern, entry);
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

	// TODO: req.url vs req.href disparity
	async function draw(req, route, context) {
		let props = { url: req.href };

		if (route.loaders.length > 0) {
			await Promise.all(
				route.loaders.map(p => p(req, context))
			).then(list => {
				// TODO? deep merge props
				Object.assign(props, ...list);
			});
		}

		return render(route.views, props);
	}

	return createServer(async (req, res) => {
		let page={}, request=parse(req, decode);
		let route, isAsset, context={ status: 0 };
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
			page = await draw(request, route, context);
		} catch (err) {
			context.error = err;
			context.status = context.status || err.statusCode || err.status || 500;
			// look up error by specificity
			const key = String(context.status);
			const route = ERRORS[key] || ERRORS[key[0] + 'xx'] || ERRORS['xxx']
			page = await draw(request, route, context);
		} finally {
			if (isAsset) return; // handled
			if (context.redirect) {
				context.headers.location = resolve(request.href, context.redirect);
				context.status = (context.status > 300 && context.status < 400) ? context.status : 302;
			}
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

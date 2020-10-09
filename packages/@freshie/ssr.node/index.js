import parse from '@polka/url';
import regexparam from 'regexparam';
import { createServer } from 'http';

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
export function start(options={}) {
	const { decode, port, render, layout } = options;
	setup(); //=> attach app routes
	return createServer(async (req, res) => {
		let info, route, method=req.method;
		if (method !== 'GET' && method !== 'HEAD') {
			res.statusCode = 405;
			return res.end();
		}

		info = parse(req, decode);
		route = find(info.pathname);
		if (!route) return (res.statusCode=404,res.end());

		info.params = route.params;
		info.query = info.query || {};
		info.headers = req.headers;

		let props = { url: req.url };
		let head='', body='', context={ status: 0, ssr: true };
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

			let view = layout(route.views, props);
			({ head, body } = await render(view));
		} catch (err) {
			console.log(err); // TODO: remove
			context.status = context.status || err.status || 500;
			body = `<p>${err.stack}</p>`; // TODO: options.error page
		} finally {
			// props.head=head; props.body=body;
			res.writeHead(context.status || 200, context.headers);
			res.end(JSON.stringify({ head, body })); // TODO: inject/write template
			// res.end(template.isHTML ? template(props) : await render([template], props));
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

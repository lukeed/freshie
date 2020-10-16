import regexparam from 'regexparam';
import * as ErrorPage from '!!~error~!!';
import { HTML } from '!!~html~!!';

export const TREE = {};
export const Cache = caches.default;

var render, decode=true;
export function setup(options={}) {
	decode = !!options.decode;
	render = options.render;
	/* <ROUTES> */
	return function (event) {
		event.respondWith(
			run(event)
		);
	}
}

// NOTE: ideally `layout` here
export function define(route, ...Tags) {
	let i=0, tmp, loaders=[], views=[];

	for (; i < Tags.length; i++) {
		tmp = Tags[i];
		views.push(tmp.default);
		if (tmp.preload) loaders.push(tmp.preload);
	}

	add('GET', route, views, loaders);
}

export function toCache(event, res) {
	event.waitUntil(Cache.put(event.request, res.clone()));
	return res;
}

export function isCachable(res) {
	if (res.status === 206) return false;

	const vary = res.headers.get('Vary') || '';
	if (vary.includes('*')) return false;

	const ccontrol = res.headers.get('Cache-Control') || '';
	if (/(private|no-cache|no-store)/i.test(ccontrol)) return false;

	if (res.headers.has('Set-Cookie')) {
		res.headers.append('Cache-Control', 'private=Set-Cookie');
	}

	return true;
}

// todo: add anything
export function add(method, route, views, loaders=[]) {
	if (TREE[method] === void 0) {
		TREE[method] = { __roots__: new Map };
	}

	if (/[:|*]/.test(route)) {
		const { keys, pattern } = regexparam(route);
		TREE[method].__roots__.set(pattern, { keys, views, loaders });
	} else {
		TREE[method][route] = { keys:[], views, loaders };
	}
}

export function toBody(request, ctype) {
	if (ctype.includes('application/json')) return request.json();
	if (ctype.includes('application/text')) return request.text();
	if (ctype.includes('form')) return request.formData().then(toObj);
	return /text\/*/i.test(ctype) ? request.text() : request.blob();
}

export function find(method, pathname) {
	let dict = TREE[method];
	let tmp = dict[pathname];
	let match, params={};

	if (tmp !== void 0) {
		return { params, views: tmp.views, loaders: tmp.loaders };
	}

	for (const [rgx, val] of dict.__roots__) {
		match = rgx.exec(pathname);
		if (match === null) continue;

		if (val.keys.length > 0) {
			for (tmp=0; tmp < val.keys.length;) {
				params[val.keys[tmp++]] = match[tmp];
			}
		}

		return { params, views: val.views, loaders: val.loaders };
	}
}

export async function run(event) {
	const { request } = event;
	const { url, method, headers } = request;
	let { pathname, search, searchParams } = new URL(url);
	if (decode) pathname = decodeURIComponent(pathname);

	const route = find(method, pathname);
	if (!route) return new Response('404', { status: 404 });

	const isGET = /^(GET|HEAD)$/.test(method);
	const query = Object.fromEntries(searchParams);
	const req = { url, method, headers, params:route.params, path:pathname, query, search, body:null };

	if (request.body) {
		try {
			const ctype = headers.get('content-type');
			if (ctype) req.body = await toBody(request, ctype);
		} catch (err) {
			return new Response(err.message, { status: 400 });
		}
	}

	let props={ url }, head='', body='';
	let context = { status: 0, ssr: true, dev: __DEV__ };
	context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

	try {
		if (route.loaders.length > 0) {
			await Promise.all(
				route.loaders.map(p => p(req, context))
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
		// props.head=head; props.body=body;
		// TODO: react to static HTML vs HTML component
		let output = HTML.replace(/<\/body>/, body + '</body>');
		if (head) output = output.replace(/<\/head>/, head + '</head>');

		const res = new Response(output, {
			status: context.status || 200,
			headers: context.headers,
		});

		return isGET && isCachable(res) ? toCache(event, res) : res;
	}
}

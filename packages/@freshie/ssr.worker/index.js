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

function toError(status, message='') {
	const error = new Error(message);
	error.status = status;
	throw error;
}

export async function run(event) {
	const { request } = event;
	const { url, method, headers } = request;
	const isGET = /^(GET|HEAD)$/.test(method);

	let props={ url }, page={};
	let context = { status: 0, ssr: true, dev: __DEV__ };
	context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

	try {
		// TODO: detach if has custom
		if (!isGET) return toError(405);

		let { pathname, search, searchParams } = new URL(url);
		if (decode) pathname = decodeURIComponent(pathname);

		const query = search ? Object.fromEntries(searchParams) : {};
		const req = { url, method, headers, params:{}, path:pathname, query, search, body:null };

		const route = find(method, pathname);
		if (!route) return toError(404);
		req.params = route.params;

		// TODO: only if has custom
		if (false && request.body) {
			try {
				const ctype = headers.get('content-type');
				if (ctype) req.body = await toBody(request, ctype);
			} catch (err) {
				err.status = 400;
				throw err;
			}
		}

		if (route.loaders.length > 0) {
			await Promise.all(
				route.loaders.map(p => p(req, context))
			).then(list => {
				// TODO? deep merge props
				Object.assign(props, ...list);
			});
		}

		page = await render(route.views, props);
	} catch (err) {
		let next = { url };
		context.error = err;
		context.status = context.status || err.statusCode || err.status || 500;
		if (ErrorPage.preload) Object.assign(next, await ErrorPage.preload(request, context));
		page = await render([ErrorPage.default], next);
	} finally {
		// props.head=head; props.body=body;
		// TODO: static HTML vs HTML component file
		let output = HTML.replace(/<\/body>/, page.body + '</body>');
		if (page.head) output = output.replace(/<\/head>/, page.head + '</head>');

		const res = new Response(output, {
			status: context.status || 200,
			headers: context.headers,
		});

		return isGET && isCachable(res) ? toCache(event, res) : res;
	}
}

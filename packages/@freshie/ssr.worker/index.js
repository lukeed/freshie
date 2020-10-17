import regexparam from 'regexparam';
import { HTML } from '!!~html~!!';

export const TREE = {};
export const Cache = caches.default;
const ERRORS = { /* <ERRORS> */ };

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

function prepare(Tags) {
	let i=0, tmp, loaders=[], views=[];
	for (; i < Tags.length; i++) {
		tmp = Tags[i];
		views.push(tmp.default);
		if (tmp.preload) loaders.push(tmp.preload);
	}
	return { loaders, views };
}

// NOTE: ideally `layout` here
export function define(route, ...Tags) {
	let { views, loaders } = prepare(Tags);
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

async function draw(req, route, context) {
	let props = { url: req.url };

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

export async function run(event) {
	const { request } = event;
	const { url, method, headers } = request;

	const isGET = /^(GET|HEAD)$/.test(method);
	const { pathname, search, searchParams } = new URL(url);
	const query = search ? Object.fromEntries(searchParams) : {};
	const path = decode ? decodeURIComponent(pathname) : pathname;
	const req = { url, method, headers, path, query, search, params:{}, body:null };

	let page={}, context = { status: 0, ssr: true, dev: __DEV__ };
	context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

	try {
		// TODO: detach if has custom
		if (!isGET) return toError(405);

		const route = find(method, path);
		if (!route) return toError(404);

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

		req.params = route.params;
		page = await draw(req, route, context);
	} catch (err) {
		context.error = err;
		context.status = context.status || err.statusCode || err.status || 500;
		// look up error by specificity
		const key = String(context.status);
		const route = ERRORS[key] || ERRORS[key[0] + 'xx'] || ERRORS['xxx']
		page = await draw(req, route, context);
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

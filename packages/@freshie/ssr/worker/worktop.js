export const Cache = caches.default;

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

export const TREE = {};

export function add(method, route, handler) {
	if (TREE[method] === void 0) {
		TREE[method] = { __roots__: new Map };
	}

	if (/[:|*]/.test(route)) {
		const { keys, pattern } = regexparam(route);
		TREE[method].__roots__.set(pattern, { keys, handler });
	} else {
		TREE[method][route] = { keys:[], handler };
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
		return { params, handler:tmp.handler };
	}

	for (const [rgx, val] of dict.__roots__) {
		match = rgx.exec(pathname);
		if (match === null) continue;

		if (val.keys.length > 0) {
			for (tmp=0; tmp < val.keys.length;) {
				params[val.keys[tmp++]] = match[tmp];
			}
		}

		return { params, handler: val.handler };
	}

	return { params, handler: false };
}

export async function run(event) {
	const { request } = event;

	const { url, method, headers } = request;
	const { pathname, search, searchParams } = new URL(url);

	const { params, handler } = find(method, pathname);
	if (!handler) return new Response('404', { status: 404 });

	const isGET = /^(GET|HEAD)$/.test(method);
	const query = Object.fromEntries(searchParams);
	const req = { url, method, headers, path:pathname, query, search, body:null };

	if (request.body) {
		try {
			const ctype = headers.get('content-type');
			if (ctype) req.body = await toBody(request, ctype);
		} catch (err) {
			return new Response(err.message, { status: 400 });
		}
	}

	try {
		const res = await handler(req, params);
		return isGET && isCachable(res) ? toCache(event, res) : res;
	} catch (err) {
		// TODO: onError
		return new Response(err.message, { status: 500 });
	}
}

export function listen(event) {
	event.respondWith(
		Router.run(event)
	);
}

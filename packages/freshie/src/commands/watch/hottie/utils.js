// lukeed/hottie/server/utils.js

import sirv from 'sirv';
import parse from '@polka/url';

export const clients = new Map();

export function start(dir, opts={}) {
	let assets = sirv(dir, { ...opts, dev: true });

	return function (req, res, next) {
		let { pathname } = parse(req);

		if (pathname !== '/_hmr') {
			return assets(req, res, next);
		}

		res.writeHead(200, {
			'connection': 'keep-alive',
			'content-type': 'text/event-stream',
			'transfer-encoding': 'identity',
			'cache-control': 'no-cache',
		});

		let key = Math.random().toString(36).slice(2);
		let message = format(key, 'start');
		res.connection.setTimeout(0);
		clients.set(key, res);

		req.once('close', () => {
			clients.delete(key);
			res.end();
		});

		res.write(message);
	};
}

export function format(data, event, id) {
	let msg = '';
	if (id) msg += `id: ${id}\n`;
	if (event) msg += `event: hmr:${event}\n`;
	return msg + `data: ${data}\n\n`;
}

export function broadcast(event, data) {
	let msg = format(data, event);
	for (let [, res] of clients) res.write(msg);
}

export function stop(callback) {
	for (let [, res] of clients) res.end();
	if (callback) callback();
}

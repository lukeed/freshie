import { createServer } from 'http';
import * as utils from './utils';

export default function (dir, opts = {}) {
	const handler = utils.start(dir, opts);
	const server = createServer(handler);
	const close = server.close.bind(server);

	server.broadcast = utils.broadcast;
	server.close = (cb) => {
		utils.stop();
		return close(cb);
	};

	return server;
}

import colors from 'kleur';
import laccess from 'local-access';
// TODO: externalize
import hottie from './hottie';

import type { AddressInfo } from 'net';
import type { Server } from 'http';

interface DevServer extends Server {
	broadcast(event: string, data: string): void;
}

//  HTTPS
const { HOST, PORT } = process.env;

export default function (dir: string, argv: Argv.Watch, options = {}): Promise<DevServer> {
	let https = false; // TODO
	let hostname = HOST || argv.host;
	let port = Number(PORT || argv.port);

	const server = hottie(dir, options) as DevServer;

	return new Promise((res, rej) => {
		// TODO: attach SSR bits
		server.listen(port, hostname, () => {
			let { address } = server.address() as AddressInfo;
			let isLocal = /^(::1?|localhost)$/.test(address);
			hostname = isLocal ? 'localhost' : address;

			const write = (msg: string) => process.stdout.write(msg + '\n');
			const { local, network } = laccess({ port, hostname, https });

			// lukeed/sirv
			write('\n  ' + colors.green('Your application is ready~! 🚀\n'));
			write('  ' + colors.bold('- Local:') + '      ' + local);
			isLocal || write('  ' + colors.bold('- Network:') + '    ' + network);
			let border = '─'.repeat(Math.min(process.stdout.columns, 36) / 2);
			write('\n' + border + colors.inverse(' LOGS ') + border + '\n');

			return res(server);
		});
	});
}

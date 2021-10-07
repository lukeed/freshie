const argv = require('mri')(process.argv.slice(2), {
	default: {
		'C': '.',
	},
	boolean: [
		'minify',
		'sourcemap',
		'ssr',
	],
	alias: {
		'C': 'cwd',
		'm': 'minify',
		'x': 'sourcemap',
		'v': 'version',
		'h': 'help',
	}
});

// note: injected
declare const VERSION: string;

if (argv.v) {
	console.log(`freshie, v${VERSION}`);
	process.exit(0);
}

if (argv.h) {
	let output = '';
	output += '\n  Usage';
	output += '\n    freshie <command> [options]';
	output += '\n';
	output += '\n  Available Commands';
	output += '\n    build    Build the project';
	output += '\n    dev      Develop the project';
	output += '\n';
	output += '\n  Options';
	output += '\n    -C, --cwd          Directory to resolve from  (default .)';
	output += '\n    -m, --minify       Minify built assets';
	output += '\n    -x, --sourcemap    Generate sourcemap(s)';
	output += '\n    -v, --version      Displays current version';
	output += '\n    -h, --help         Displays this message';
	output += '\n';

	process.stdout.write(output + '\n');
	process.exit(0);
}

function bail(msg: string): never {
	console.error('ERROR', msg);
	process.exit(1);
}

(async function () {
	let name: string = (argv._[0] as string || '').trim().toLowerCase();
	if (!name) return bail('Missing <command> argument');

	type Command = keyof typeof import('./core');
	let command = require('./core')[name as Command];
	if (!command) return bail(`Unknown "${name}" command`);

	try {
		argv._ = argv._.slice(1);
		await command(argv);
	} catch (err) {
		let e = err as Error;
		return bail(e.stack || e.message);
	}
})();

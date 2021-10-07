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

(async function () {
	try {
		let name: string = (argv._[0] || '').trim().toLowerCase();
		if (!name) throw new Error('Missing <command> argument');

		// type Commands = keyof typeof import('./core');
		// let command = await import('./core').then(m => m[name as Commands]);
		// if (!command) throw new Error(`Unknown "${name}" command`);

		argv._ = argv._.slice(1);
		// await command(argv);
	} catch (err) {
		console.error('ERROR', (err as Error).stack);
		process.exit(1);
	}
})();

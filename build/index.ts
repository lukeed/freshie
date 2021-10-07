import { foobar } from './bundle';

await Promise.all([
	foobar('freshie', {
		'src/bin.ts': 'bin.js',
		'src/core.ts': 'core.js'
	})
]);

import { bundle } from './bundle';

await Promise.all([
	bundle('freshie', {
		'src/bin.ts': 'bin.js',
		'src/core.ts': 'core.js'
	})
]);

import { relative } from 'path';
// import HTML from './html';

import type { Argv, Rollup } from '../../internal';

/**
 * Create a Watcher from base config
 * @param config {import('rollup').RollupWatchOptions}
 * @returns {import('rollup').RollupWatcher}
 */
export default function (config: Rollup.Config, argv: Required<Argv>): Rollup.Watcher {
	const { src, dest } = argv;
	// const { onUpdate, onError } = TODO;
	// const hasMap = !!config.output.sourcemap;

	// dev-only plugins
	// config.plugins.push(
	// 	HTML({ src })
	// );

	// Initialize Watcher
	// Attach logging/event listeners
	const watcher: Rollup.Watcher = require('rollup').watch(config);

	let UPDATES: string[] = [];
	let CHANGED: Set<string> = new Set;

	watcher.on('change', file => {
		if (file.startsWith(src)) {
			CHANGED.add('/' + relative(src, file));
		} else console.error('[CHANGE] NOT WITHIN SOURCE: "%s"', file)
	});

	watcher.on('event', evt => {
		console.log(evt);

		switch (evt.code) {
			case 'START': {
				UPDATES = [...CHANGED];
				CHANGED.clear();
				break;
			}

			case 'BUNDLE_END': {
				// TODO: prettify
				console.info(`Bundled in ${evt.duration}ms`);
				// if (onUpdate && UPDATES.length) onUpdate(UPDATES);
				break;
			}

			case 'ERROR': {
				console.error('ERROR', evt.error);
				break;
			}
		}
	});

	return watcher;
}

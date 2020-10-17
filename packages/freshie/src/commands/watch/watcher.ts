import { relative } from 'path';
// import HTML from './html';

interface EventHooks {
	onError?(msg: string): void;
	onUpdate?(files: string[]): void;
}

export default function (config: Rollup.Config, argv: Argv.Watch, hooks: EventHooks = {}): Rollup.Watcher {
	const { src, dest } = argv;
	const { onUpdate, onError } = hooks;
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
		// console.log(evt);

		switch (evt.code) {
			case 'START': {
				UPDATES = [...CHANGED];
				CHANGED.clear();
				break;
			}

			case 'BUNDLE_END': {
				// TODO: prettify timing value (utils.pretty)
				console.info(`Bundled in ${evt.duration}ms`);
				if (onUpdate && UPDATES.length) onUpdate(UPDATES);
				break;
			}

			case 'ERROR': {
				// TODO: onError
				console.error('ERROR', evt.error);
				break;
			}
		}
	});

	return watcher;
}

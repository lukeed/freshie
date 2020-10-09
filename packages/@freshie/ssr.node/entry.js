import { ssr, layout } from '~!!ui!!~'; // alias
import { start } from './index';

const { PORT=3000 } = process.env;

start({
	layout,
	render: ssr,
	port: PORT,
});

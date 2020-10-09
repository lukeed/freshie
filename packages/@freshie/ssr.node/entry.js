import { ssr } from '~!!ui!!~'; // alias
import { start } from './index';

const { PORT=3000 } = process.env;

start({ render: ssr, port: PORT });

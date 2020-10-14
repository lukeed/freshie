import { ssr } from '~!!ui!!~'; // alias
import * as App from './index';

const handler = App.setup({ render: ssr });
addEventListener('fetch', handler);

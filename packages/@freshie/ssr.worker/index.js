import * as Router from './worktop';
import { template } from '~template'; // TODO: alias
import { render } from '~render'; // TODO: alias

// TODO: render / better name
export function foobar(pattern, views) {
	console.log('todo', views);
	Router.add('GET', pattern);
}

export { listen } from './worktop';

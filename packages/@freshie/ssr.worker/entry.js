import * as App from 'freshie/server';

function define(pattern, ...Tags) {
	App.render(pattern, Tags);
}

/* <ROUTES> */

addEventListener('fetch', App.listen);

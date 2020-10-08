const { join } = require('path');

exports.ssr = function (config) {
	config.render = join(__dirname, 'render.mjs');
}

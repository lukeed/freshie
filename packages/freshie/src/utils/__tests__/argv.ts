import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as utils from '../argv';

const toBool = suite('toBool');

toBool('should be a function', () => {
	assert.type(utils.toBool, 'function');
});

toBool('should parse `false` values', () => {
	assert.is(utils.toBool(0), false);
	assert.is(utils.toBool('0'), false);
	assert.is(utils.toBool(false), false);
	assert.is(utils.toBool('false'), false);
});

toBool('should return `true` otherwise`', () => {
	assert.is(utils.toBool(), true);
	assert.is(utils.toBool(''), true);
	assert.is(utils.toBool(null), true);
	assert.is(utils.toBool(undefined), true);
	assert.is(utils.toBool('hello'), true);
	assert.is(utils.toBool(123), true);
	assert.is(utils.toBool(1), true);
});

toBool.run();

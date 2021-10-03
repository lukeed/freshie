import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as utils from './errors';

const match = suite('match', {
	'401': '401',
	'4xx': '4xx',
	'419': '419',
	'5xx': '5xx',
	'502': '502',
	'xxx': 'xxx',
});

match('should be a function', () => {
	assert.type(utils.match, 'function');
});

match('should load exact matches', ctx => {
	assert.is(utils.match(401, ctx), '401');
	assert.is(utils.match(419, ctx), '419');
	assert.is(utils.match(502, ctx), '502');
});

match('should load "4xx" for 4xx codes w/o exact match', ctx => {
	assert.is(utils.match(400, ctx), '4xx');
	assert.is(utils.match(402, ctx), '4xx');
	assert.is(utils.match(413, ctx), '4xx');
});

match('should load "5xx" for 5xx codes w/o exact match', ctx => {
	assert.is(utils.match(500, ctx), '5xx');
	assert.is(utils.match(501, ctx), '5xx');
	assert.is(utils.match(503, ctx), '5xx');
});

match('should load "xxx" as last resort', ctx => {
	// test only – only sees 400-500 range
	assert.is(utils.match(200, ctx), 'xxx');
	assert.is(utils.match(201, ctx), 'xxx');
	assert.is(utils.match(399, ctx), 'xxx');

	const copy = { ...ctx };

	delete copy['4xx'];
	assert.is(utils.match(400, copy), 'xxx');
	assert.is(utils.match(403, copy), 'xxx');

	delete copy['5xx'];
	assert.is(utils.match(501, copy), 'xxx');
	assert.is(utils.match(503, copy), 'xxx');
});

match.run();

import { suite } from 'uvu';
import { resolve } from 'path';
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

// ---

const normalize = suite('normalize');

normalize('should be a function', () => {
	assert.type(utils.normalize, 'function');
});

normalize('should ensure `Argv.Options` has values', () => {
	const input: Partial<Argv.Options> = {};
	const output = utils.normalize(null, input);
	assert.is(output, undefined, 'returns nothing');

	const cwd = resolve('.');

	assert.is(input.cwd, cwd);

	assert.is(input.srcDir, 'src');
	assert.is(input.destDir, 'build');

	assert.is(input.src, cwd); // "{cwd}/src" missing
	assert.is(input.dest, resolve(cwd, 'build'));

	assert.is(input.ssr, true);
	assert.is(input.minify, true);
});

normalize('should accept `Argv.Options` partial values', () => {
	const input: Partial<Argv.Options> = {
		cwd: __dirname,
		dest: 'output',
		minify: false,
	};

	utils.normalize('hello', input);

	const cwd = resolve('.');

	assert.is(input.cwd, __dirname);

	assert.is(input.srcDir, 'hello');
	assert.is(input.destDir, 'output');

	assert.is(input.src, __dirname); // "{cwd}/src" missing
	assert.is(input.dest, resolve(cwd, 'output'));

	assert.is(input.ssr, true);
	assert.is(input.minify, false);
});

normalize('should accept extra values', () => {
	const input: Partial<Argv.Options> = {};
	utils.normalize('', input, { isProd: true });
	assert.is(input.isProd, true);
});

normalize.run();

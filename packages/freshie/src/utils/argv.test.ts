import { suite } from 'uvu';
import { resolve } from 'path';
import * as assert from 'uvu/assert';
import * as utils from './argv';

import type { Argv } from '../internal';

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

toBool('should return `fallback` otherwise (default = true)', () => {
	assert.is(utils.toBool(''), true);
	assert.is(utils.toBool(null), true);
	assert.is(utils.toBool(undefined), true);
	assert.is(utils.toBool('hello'), true);
	assert.is(utils.toBool(123), true);
	assert.is(utils.toBool(1), true);
});

toBool('should return `fallback` on nullish value', () => {
	assert.is(utils.toBool(null, false), false);
	assert.is(utils.toBool(undefined, false), false);
});

toBool.run();

// ---

const normalize = suite('normalize');

normalize('should be a function', () => {
	assert.type(utils.normalize, 'function');
});

normalize('should ensure `Argv` has values', () => {
	const input: Partial<Argv> = {};
	const output = utils.normalize(input as Argv, false);
	assert.is(output, undefined, 'returns nothing');

	const cwd = resolve('.');

	assert.is(input.cwd, cwd);

	assert.is(input.srcDir, 'src');
	assert.is(input.destDir, 'build');

	assert.is(input.src, cwd); // "{cwd}/src" missing
	assert.is(input.dest, resolve(cwd, 'build'));

	assert.is(input.ssr, true);
	assert.is(input.isProd, false);
	assert.is(input.minify, false);
});

normalize('should accept `Argv` partial values', () => {
	const input: Argv = {
		cwd: __dirname,
		minify: true,
	};

	utils.normalize(input, false);

	assert.is(input.cwd, __dirname);

	assert.is(input.srcDir, 'src');
	assert.is(input.destDir, 'build');

	assert.is(input.src, __dirname); // "{cwd}/src" missing
	assert.is(input.dest, resolve(__dirname, 'build'));

	assert.is(input.ssr, true);
	assert.is(input.isProd, false);
	assert.is(input.sourcemap, true); // isProd = false
	assert.is(input.minify, true); // respect input
});

normalize('should accept extra values', () => {
	const input: Partial<Argv> = {};
	utils.normalize(input as Argv, true);
	assert.is(input.isProd, true);
	assert.is(input.sourcemap, false);
	assert.is(input.minify, true);
});

normalize('should allow `minify` to be disabled in production', () => {
	const input: Partial<Argv> = { minify: false };
	utils.normalize(input as Argv, true);
	assert.is(input.isProd, true);
	assert.is(input.minify, false);
});

normalize('should allow `sourcemap` to be enabled in production', () => {
	const input: Partial<Argv> = { sourcemap: true };
	utils.normalize(input as Argv, true);
	assert.is(input.isProd, true);
	assert.is(input.sourcemap, true);
});

normalize.run();

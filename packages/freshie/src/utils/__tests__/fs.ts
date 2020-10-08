import { suite } from 'uvu';
import { join, isAbsolute } from 'path';
import * as assert from 'uvu/assert';
import * as utils from '../fs';

const read = suite('read');

read('should be a function', () => {
	assert.type(utils.read, 'function');
});

read('should yield a Buffer', async () => {
	const out = await utils.read(__filename);
	assert.instance(out, Buffer);
});

read('should yield a "utf8" string', async () => {
	const out = await utils.read(__filename, 'utf8');
	assert.type(out, 'string');
});

read.run();

// ---

const write = suite('write');

write('should be a function', () => {
	assert.type(utils.write, 'function');
});

write('should write file with Buffer data', async () => {
	const file = join(__dirname, 'hello.txt');

	try {
		await utils.write(file, Buffer.from('hello'));
	} finally {
		await utils.remove(file);
	}
});

write('should write file with "utf8" data', async () => {
	const file = join(__dirname, 'hello.txt');

	try {
		await utils.write(file, 'hello');
	} finally {
		await utils.remove(file);
	}
});

write.run();

// ---

const exists = suite('exists');

exists('should be a function', () => {
	assert.type(utils.exists, 'function');
});

exists('should return `true` if file exists', () => {
	assert.is(utils.exists(__filename), true);
});

exists('should return `true` if directory exists', () => {
	assert.is(utils.exists(__dirname), true);
});

exists('should return `false` if path does not exist', () => {
	const foobar = join(__dirname, 'foobar');
	assert.is(utils.exists(foobar), false);
});

exists.run();

// ---

const isDir = suite('isDir');

isDir('should be a function', () => {
	assert.type(utils.isDir, 'function');
});

isDir('should return `true` for existing directory', () => {
	assert.is(utils.isDir(__dirname), true);
});

isDir('should return `false` for existing file', () => {
	assert.is(utils.isDir(__filename), false);
});

isDir('should return `false` for non-existent path', () => {
	const foobar = join(__dirname, 'foobar');
	assert.is(utils.isDir(foobar), false);
});

isDir.run();

// ---

const list = suite('list');

list('should be a function', () => {
	assert.type(utils.list, 'function');
});

list('should yield Array of relative strings', async () => {
	const out = await utils.list(__dirname);
	assert.instance(out, Array);
	assert.type(out[0], 'string');
	assert.ok(!isAbsolute(out[0]));
});

list('should throw error if input is file', async () => {
	try {
		await utils.list(__filename);
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.match(err.message, 'ENOTDIR');
	}
});

list('should throw error if input does not exist', async () => {
	try {
		await utils.list(join(__dirname, 'foobar'));
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error);
		assert.match(err.message, 'ENOENT');
	}
});

list.run();

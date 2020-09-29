import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as utils from '../routes';

const toSegment = suite('to_segment');

toSegment('should be a function', () => {
	assert.type(utils.to_segment, 'function');
});

toSegment('should return tuples', () => {
	assert.equal(utils.to_segment(''), [0, '']);
});

toSegment('should handle "static" routes', () => {
	assert.equal(utils.to_segment('index'), [0, '']);
	assert.equal(utils.to_segment('blog'), [0, 'blog']);
	assert.equal(utils.to_segment('about'), [0, 'about']);
	assert.equal(utils.to_segment('foo.bar'), [0, 'foo.bar']);
});

toSegment('should handle "param" routes', () => {
	assert.equal(utils.to_segment('[id]'), [1, ':id']);
	assert.equal(utils.to_segment('[slug]'), [1, ':slug']);

	assert.equal(utils.to_segment('[id?]'), [1, ':id?']);
	assert.equal(utils.to_segment('[slug?]'), [1, ':slug?']);
});

toSegment('should handle "wild" routes', () => {
	assert.equal(utils.to_segment('[...id]'), [2, '*', 'id']);
	assert.equal(utils.to_segment('[...slug]'), [2, '*', 'slug']);
});

toSegment.run();

// ---

const toPattern = suite('to_pattern');

toPattern('should be a function', () => {
	assert.type(utils.to_pattern, 'function');
});

toPattern('should return { pattern, wild } object', () => {
	assert.equal(
		utils.to_pattern(''),
		{ pattern: '/', wild: null }
	);
});

toPattern('should handle "static" routes', () => {
	assert.equal(
		utils.to_pattern('index.js'),
		{ pattern: '/', wild: null }
	);

	assert.equal(
		utils.to_pattern('blog.tsx'),
		{ pattern: '/blog', wild: null }
	);

	assert.equal(
		utils.to_pattern('blog/hello.ts'),
		{ pattern: '/blog/hello', wild: null }
	);

	assert.equal(
		utils.to_pattern('about/index.js'),
		{ pattern: '/about', wild: null }
	);

	assert.equal(
		utils.to_pattern('foo.bar'),
		{ pattern: '/foo', wild: null }
	);
});

toPattern('should handle "param" routes', () => {
	assert.equal(
		utils.to_pattern('[id].js'),
		{ pattern: '/:id', wild: null }
	);

	assert.equal(
		utils.to_pattern('[slug].js'),
		{ pattern: '/:slug', wild: null }
	);

	assert.equal(
		utils.to_pattern('blog/[id?].ts'),
		{ pattern: '/blog/:id?', wild: null }
	);

	assert.equal(
		utils.to_pattern('foo/bar/[slug?].jsx'),
		{ pattern: '/foo/bar/:slug?', wild: null }
	);

	assert.equal(
		utils.to_pattern('blog/[year]/[month]/[slug]/index.jsx'),
		{ pattern: '/blog/:year/:month/:slug', wild: null }
	);
});

toPattern('should handle "wild" routes', () => {
	assert.equal(
		utils.to_pattern('[...id].tsx'),
		{ pattern: '/*', wild: 'id' }
	);

	assert.equal(
		utils.to_pattern('blog/[...slug].js'),
		{ pattern: '/blog/*', wild: 'slug' }
	);
});

toPattern.run();

#!/usr/bin/env node
const sade = require('sade');
const commands = require('./build');
const { version } = require('./package');

sade('freshie')
	.version(version)
	.option('-C, --cwd', 'The relative working directory', '.')

	.command('build [src]')
	.describe('Compile the Worker(s) within a directory.')
	.option('-m, --minify', 'Minify built assets', true)
	.action(commands.build)

	// TODO; HTTP/2 option flags
	.command('watch [src]').alias('dev')
	.describe('Compile the Worker(s) within a directory.')
	.option('-H, --host', 'A hostname on which to start the application', 'localhost')
	.option('-p, --port', 'A port number on which to start the application', 8080)
	.action(commands.watch)

	.parse(process.argv);

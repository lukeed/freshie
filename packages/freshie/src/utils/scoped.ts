import * as utils from './index';

export const packages: Set<string> = new Set();

export function list(cwd: string): Set<string> {
	if (packages.size) return packages;

	const rgx = /^@freshie\//i;
	const pkg = utils.load<TODO>('package.json', cwd);

	if (pkg) Object.keys(
		Object.assign({}, pkg.dependencies, pkg.devDependencies)
	).forEach(name => rgx.test(name) && packages.add(name));

	return packages;
}

import Polka from '~polka'; // TODO: alias
import { parser } from '~parser'; // TODO: alias
import { render } from '~renderer'; // TODO: alias
import { template } from '~template'; // TODO: alias

// TODO: must have parser|params
var App = Polka();

// TODO: layouts
async function reply(Tags, req, res) {
	let props = {
		url: req.url
	};

	let head='', body='', context={ status: 0, ssr: true };
	context.headers = { 'Content-Type': 'text/html;charset=utf-8' };

	try {
		let i=0, tmp, loaders=[], views=[];

		for (; i < Tags.length; i++) {
			tmp = Tags[i];
			views.push(tmp.default);
			if (tmp.preload) loaders.push(tmp.preload);
		}

		if (loaders.length > 0) {
			let xyz = parser(req);

			let info = {
				params: req.params,
				pathname: xyz.pathname,
				search: xyz.search,
				query: xyz.query,
				href: xyz.href,
			};

			await Promise.all(
				loaders.map(p => p(info, context))
			).then(list => {
				// TODO? deep merge props
				Object.assign(props, ...list);
			});
		}

		({ head, body } = await render(views, props));
	} catch (err) {
		res.statusCode = context.status || 500;
		body = `<p>${err.stack}</p>`; // todo: customize
	} finally {
		props.head=head; props.body=body;
		res.writeHead(context.status || 200, context.heaers);
		res.end(template.isHTML ? template(props) : await render([template], props));
	}
}

function define(pattern, ...Tags) {
	App.get(pattern, reply.bind(0, [template, ...Tags]));
}

/* <ROUTES> */

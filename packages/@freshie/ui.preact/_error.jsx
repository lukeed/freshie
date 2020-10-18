import { h, Fragment } from 'preact';

export function preload(req, context) {
	console.log('_error.jsx got:', req, context);
	return { status: context.status }
}

const messages = {
	'400': 'Bad Request',
	'404': 'Page Not Found',
	'429': 'Too Many Requests',
	'500': 'Unknown Error',
}

export default function Error(props) {
	const { status=500 } = props;

	return (
		<>
			<h1>Error ({status})</h1>
			<p>{ messages[status] }</p>
		</>
	);
}

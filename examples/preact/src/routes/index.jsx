import { h, Fragment } from 'preact';

export default function Home(props) {
	const name = props.name || 'world';

	return (
		<>
			<h1>Hello {name}</h1>
			<a href="/blog">Blog</a>
		</>
	)
}

import { h } from 'preact';

export default function Layout(props) {
	return (
		<main className="layout">
			{ props.children }
		</main>
	)
}

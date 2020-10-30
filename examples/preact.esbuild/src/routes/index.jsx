import { h, Fragment } from 'preact';
import * as styles from './index.styl';

export default function Home(props) {
	const name = props.name || 'world';

	return (
		<>
			<h1 className={styles.title}>Hello {name}</h1>
			<a href="/blog">Blog</a>
		</>
	)
}

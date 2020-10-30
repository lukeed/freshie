import { h } from 'preact';
import * as styles from './_layout.styl';

export default function Layout(props) {
	return (
		<main className={styles.layout}>
			{props.children}
		</main>
	);
}

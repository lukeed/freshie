import { h, Fragment } from 'preact';

export async function preload() {
	let res = await fetch(`https://jsonplaceholder.typicode.com/posts`);
	let articles = await res.json();
	return { articles };
}

export default function Blog(props) {
	// <svelte:head>
	// <title>Articles</title>
	// </svelte:head>

	return (
		<>
			<h1>All Articles</h1>

			<div className="content">
				<ul>
					{
						props.articles.map(obj => (
							<li key={obj.id}>
								<a href={`/blog/${obj.id}`}>{obj.title}</a>
							</li>
						))
					}
				</ul>
			</div>
		</>
	)
}

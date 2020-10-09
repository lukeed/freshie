import { h, Fragment } from 'preact';

export async function preload(req) {
	let res = await fetch(`https://jsonplaceholder.typicode.com/posts/${req.params.id}`);
	let article = await res.json();
	return { article };
}

export default function Article(props) {
	// {/* <svelte:head>
	// 	<title>{article.title}</title>
	// </svelte:head> */}
	return (
		<>
			<h1>{ props.article.title }</h1>
			<div className="content" dangerouslySetInnerHTML={{ __html: props.article.body }} />
		</>
	)
}

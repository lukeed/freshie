export function render(Tag, props={}) {
	let { head='', html='', css } = Tag.render(props);
	if (css && css.code) head += `<style>${css.code}</style>`;
	return { head, body: html };
}

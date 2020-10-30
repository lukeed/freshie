var cache = [];
var isDOM = typeof window < 'u';

export function link(href, tmp) {
	if (!isDOM || !!~cache.indexOf(href)) return;
	if (!cache.length) {
		for (var i=0, arr=document.styleSheets; tmp = arr[i]; i++) {
			if (cache.push(tmp.href) && tmp.href === href) return;
		}
	}
	(tmp = document.createElement('link')).rel='stylesheet';
	document.head.appendChild(tmp);
	cache.push(tmp.href = href);
}

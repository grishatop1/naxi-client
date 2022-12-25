export function respondToVisibility(element, callback) {
	var options = {
		root: document.documentElement,
	};

	var observer = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				callback();
				observer.unobserve(entry.target)
			}
		})
	});

	observer.observe(element);
}

export function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

export let fetch_metadata = async (url) => {
	try {
		let request = await fetch(url);
		let data = await request.json();
		const unparsed_html = data['rs']
		const parsed = new DOMParser().parseFromString(unparsed_html, "text/xml");

		const artist = parsed.querySelector(".details p span").innerHTML + " ";
		const song = [].reduce.call(parsed.querySelector(".details p").childNodes, function (a, b) { return a + (b.nodeType === 3 ? b.textContent : '').trim(); }, '');

		const test = song + artist;
		if (test.trim() == "") {
			return null;
		}

		return {
			artist: artist.trim(),
			song: song.trim()
		}
	} catch {
		return;
	}
}

export function is_element_in_viewport(el) {
	var top = el.offsetTop;
	var left = el.offsetLeft;
	var width = el.offsetWidth;
	var height = el.offsetHeight;

	while (el.offsetParent) {
		el = el.offsetParent;
		top += el.offsetTop;
		left += el.offsetLeft;
	}

	return (
		top >= window.pageYOffset &&
		left >= window.pageXOffset &&
		(top + height) <= (window.pageYOffset + window.innerHeight) &&
		(left + width) <= (window.pageXOffset + window.innerWidth)
	);
}
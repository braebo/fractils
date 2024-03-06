/**
 * Strips newlines and tabs from a CSS string.
 *
 * If the string starts with a '{', it is removed (the leading '{' is a useful
 * hack that tricks the `Comment tagged templates` extension into recognizing
 * the string as CSS, but leaving it in the string would invalidate it).
 */
export function trimCss(css: `{${string}}`) {
	let str = css as string
	if (str.startsWith('{')) {
		str = str.slice(1)
	}
	if (str.endsWith('}')) {
		str = str.slice(0, -1)
	}
	return str.replaceAll('\n', '').replaceAll('\t', '')
}

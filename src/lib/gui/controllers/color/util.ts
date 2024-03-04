// Source: https://github.com/irojs/iro-core/blob/typescript/src/util.ts

// Keep track of html <base> elements for resolveSvgUrl
// getElementsByTagName returns a live HTMLCollection, which stays in sync with the DOM tree
// So it only needs to be called once
let BASE_ELEMENTS: HTMLCollectionOf<HTMLBaseElement> | undefined

/**
 * @desc Resolve an SVG reference URL
 * This is required to work around how Safari and iOS webviews handle gradient URLS under certain conditions
 * If a page is using a client-side routing library which makes use of the HTML <base> tag,
 * Safari won't be able to render SVG gradients properly (as they are referenced by URLs)
 * More info on the problem:
 * https://stackoverflow.com/questions/19742805/angular-and-svg-filters/19753427#19753427
 * https://github.com/jaames/iro.js/issues/18
 * https://github.com/jaames/iro.js/issues/45
 * https://github.com/jaames/iro.js/pull/89
 * @props url - SVG reference URL
 */
export function resolveSvgUrl(url: string) {
	if (!BASE_ELEMENTS) BASE_ELEMENTS = document.getElementsByTagName('base')
	// Sniff useragent string to check if the user is running Safari
	const ua = window.navigator.userAgent
	const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
	const isIos = /iPhone|iPod|iPad/i.test(ua)
	const location = window.location
	return (isSafari || isIos) && BASE_ELEMENTS.length > 0
		? `${location.protocol}//${location.host}${location.pathname}${location.search}${url}`
		: url
}

/**
 * @desc Get the path commands to draw an svg arc
 * @props cx - arc center point x
 * @props cy - arc center point y
 * @props radius - arc radius
 * @props startAngle - arc start angle
 * @props endAngle - arc end angle
 */
export function getSvgArcPath(
	cx: number,
	cy: number,
	radius: number,
	startAngle: number,
	endAngle: number,
) {
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
	startAngle *= Math.PI / 180
	endAngle *= Math.PI / 180
	const x1 = cx + radius * Math.cos(endAngle)
	const y1 = cy + radius * Math.sin(endAngle)
	const x2 = cx + radius * Math.cos(startAngle)
	const y2 = cy + radius * Math.sin(startAngle)
	return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`
}

/**
 * @desc Given a specifc (x, y) position, test if there's a handle there and return its index, else return null.
 *       This is used for components like the box and wheel which support multiple handles when multicolor is active
 * @props x - point x position
 * @props y - point y position
 * @props handlePositions - array of {x, y} coords for each handle
 */
export function getHandleAtPoint(
	handleRadius: number,
	x: number,
	y: number,
	handlePositions: { x: number; y: number }[],
) {
	for (let i = 0; i < handlePositions.length; i++) {
		const dX = handlePositions[i].x - x
		const dY = handlePositions[i].y - y
		const dist = Math.sqrt(dX * dX + dY * dY)
		if (dist < handleRadius) {
			return i
		}
	}
	return null
}

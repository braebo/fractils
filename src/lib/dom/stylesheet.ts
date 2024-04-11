// import { CSS_VAR_INNER } from '../regex/cssVars'

// export function singleStylesheet(css: string) {
// 	let once = false

// 	return () => {
// 		if (once) return
// 		once = true
// 		const style = document.createElement('style')
// 		style.innerHTML = css
// 		document.head.appendChild(style)
// 	}
// }

// /**
//  *
//  * @param string - A string containing CSS variables.
//  * @param target - The element on which the CSS variables are defined.
//  * @returns
//  */
// export function resolveAndInjectVars(string: string, target: HTMLElement) {
// 	return string.replace(CSS_VAR_INNER, (str, match) => {
// 		return target.style.getPropertyValue(match).trim() || str
// 	})
// }

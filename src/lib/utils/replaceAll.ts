// source - https://github.com/webdiscus/ansis/blob/master/src/utils.js

/**
 * Replace all matched strings.
 * @remarks This implementation is over 30% faster than String.replaceAll().
 */
export const replaceAll = (str: string, searchValue: string, replaceValue: string) => {
	// visible style has empty open/close props
	if (searchValue === '') return str

	let substringLength = searchValue.length
	let lastPos = 0
	let result = ''
	let pos

	while (~(pos = str.indexOf(searchValue, lastPos))) {
		result += str.slice(lastPos, pos) + replaceValue
		lastPos = pos + substringLength
	}

	return lastPos ? result + str.slice(lastPos) : str
}

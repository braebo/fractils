// Original https://github.com/jshttp/cookie

export function parse(str: string): Record<string, string> {
	const obj: Record<string, string> = {}
	let i = 0

	while (i < str.length) {
		let eq = str.indexOf('=', i)
		let sc = str.indexOf(';', i)

		// When there's no '=', or it comes after a `;`, skip it.
		if (eq === -1 || (sc !== -1 && eq > sc)) {
			i = sc + 1
			continue
		}

		// The next `;` (or end of string).
		let end = sc > -1 ? sc : str.length

		// Extract key and trim spaces
		let key = str.substring(i, eq).trim()
		if (key && !Object.hasOwnProperty.call(obj, key)) {
			// Handle empty values and trimming
			let val = eq + 1 < end ? str.substring(eq + 1, end).trim() : ''
			if (val.charCodeAt(0) === 0x22 && val.charCodeAt(val.length - 1) === 0x22) {
				val = val.slice(1, -1)
			}

			// Decode and handle potential exceptions
			try {
				obj[key] = val.includes('%') ? decodeURIComponent(val) : val
			} catch (e) {
				obj[key] = val
			}
		}

		i = end + 1
	}

	return obj
}

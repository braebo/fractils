export function debounce(func: Function, wait: number) {
	let timeout: ReturnType<typeof setTimeout> | null

	return function (...args: any[]) {
		const later = () => {
			timeout = null
			func(...args)
		}

		clearTimeout(timeout!)
		timeout = setTimeout(later, wait)
	}
}

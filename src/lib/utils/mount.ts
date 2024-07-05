/**
 * Appends a list of elements to one another in the order they are passed.
 *
 * @example
 * ```typescript
 * append(foo, bar, baz, qux)
 * // is equivalent to:
 * foo.appendChild(bar)
 * bar.appendChild(baz)
 * baz.appendChild(qux)
 * ```
 */
export function append(...els: Element[]) {
	let i = 0

	const e = [...els]
	/** parent */
	let p = e.shift()
	/** child */
	let c = e.shift()

	function mount(..._e: Element[]) {
		if (i++ > 500) throw new Error('infinite loop detected! (500 iteration limit)')

		if (p && c) p.appendChild(c)

		p = c
		c = _e.shift()

		if (c) {
			mount(..._e)
		}
	}
	mount(...e)
}

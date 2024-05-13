/**
 * Generate a random ID.
 * @param length The length of the ID to generate.  Default: `21`
 */
export function nanoid(length = 21) {
	return crypto
		.getRandomValues(new Uint8Array(length))
		.reduce(
			(t, e) =>
				(t +=
					(e &= 63) < 36
						? e.toString(36)
						: e < 62
							? (e - 26).toString(36).toUpperCase()
							: e > 62
								? '-'
								: '_'),
			'',
		)
}

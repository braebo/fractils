/**
 * Short timestamp.
 * @param length - Timestamp character length.
 */
export function timestamp(length = 12) {
	return new Date()
		.toISOString()
		.replace(/[-:.TZ]/g, '')
		.slice(2, Math.max(2, length))
}

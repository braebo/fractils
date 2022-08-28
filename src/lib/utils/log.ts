const browser =
	typeof globalThis.window !== 'undefined' && typeof globalThis.window.document !== 'undefined'

const dev = () => {
	if (!browser) return false
	return process?.env?.NODE_ENV === 'development' ?? import.meta?.env?.DEV ?? false
}

/**
 * A simple logger that only runs in dev environments.
 * @param msg - A string or object to log
 * @param color - Any CSS color value ( named | hex | rgb | hsl )
 * @param bgColor - Same as color ⇧
 * @param fontSize - Any number
 * @param css - Optional additional CSS
 */
export const log = (
	msg: string | any,
	color = 'lightblue',
	bgColor = 'transparent',
	fontSize = 15,
	css = '',
) => {
	if (!dev) return

	if (typeof msg == 'string')
		return () =>
			console.log(
				`%c${msg}`,
				`padding:5px;color:${color};background: ${bgColor};border:1px solid ${color};size:${fontSize}px;${css}`,
			)

	return console.log(msg)
}

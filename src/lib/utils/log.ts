const dev = !!import.meta.env.DEV

/**
 *  Debug logger with optional theming.  Dev env only.
 *
 * @param msg - A message to log (objects are logged without theming)
 * @param color - Any CSS ( named | hex | rgb | hsl ) color value
 * @param bgColor - Same as {@link color}
 * @param fontSize - Any number
 * @param css - Optional additional CSS
 *
 * @remarks
 * The dev variable inherits the sveltekit {@link https://kit.svelte.dev/docs#modules-$app-env | $app/env} variable.
 *
 */

class Logger {
	log(msg: string | unknown, color: string, bgColor: string, fontSize: number) {
		return dev
			? typeof msg === 'string'
				? console.log(
						`%c${msg}`,
						`
					size:${fontSize}px;
					color:${color};
					background: ${bgColor};
					border:1px solid ${color};
					padding:0.5px 5px;
					border-radius: 4px;
					line-height: 1.4rem;
				`,
				  )
				: console.log(msg)
			: null
	}
}

export const log = (msg: unknown, color = 'lightblue', bgColor = '#1d1d1d', fontSize = 15) =>
	new Logger().log(msg, color, bgColor, fontSize)

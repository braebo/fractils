import { randomColor } from './color'

import { isSafari } from './safari'
import { defer } from './defer'
import { DEV } from 'esm-env'

const ENABLED = DEV
const bypassStyles = false
const bypassDefer = false

export const logger = (
	title = 'LOG',
	options?: {
		/**
		 * Whether to use the styled logger or the regular console.log.
		 * @defaultValue true
		 */
		styled?: boolean
		/**
		 * Whether to defer the log to the next idle state.
		 * @defaultValue true
		 */
		deferred?: boolean
		/**
		 * The foreground color of the log.
		 * @defaultValue randomColor()
		 */
		fg?: CSSColor
		/**
		 * The background color of the log.
		 * @defaultValue transparent
		 */
		bg?: CSSColor
		/**
		 * Any additional CSS to apply to the log.
		 * @defaultValue ''
		 */
		css?: string
	},
) => {
	options ??= {}

	const fg = options.fg || randomColor()
	const bg = options.bg || 'transparent'
	const css = isSafari ? options.css : ''

	options.styled ??= true
	const styled = options.styled && !bypassStyles

	options.deferred ??= true
	const deferred = options.deferred && !bypassDefer

	if (!ENABLED) return () => void 0

	const fn = !styled
		? (...args: any[]) => {
				console.log(`[${title}]`, ...args)
		  }
		: (...args: any[]) => {
				let messageConfig = '%c%s   '

				args.forEach((argument) => {
					const type = typeof argument
					switch (type) {
						case 'bigint':
						case 'number':
						case 'boolean':
							messageConfig += '%d   '
							break

						case 'string':
							messageConfig += '%s   '
							break

						case 'object':
						case 'undefined':
						default:
							messageConfig += '%o   '
					}
				})

				console.log(
					messageConfig,
					`color:${fg};background:${bg};padding:0.1rem;${css}`,
					`[${title}]`,
					...args,
				)
		  }

	if (!deferred) return fn

	return (...args: any[]) => defer(() => fn(...args))
}

export type CSSColor =
	| 'AliceBlue'
	| 'AntiqueWhite'
	| 'Aqua'
	| 'Aquamarine'
	| 'Azure'
	| 'Beige'
	| 'Bisque'
	| 'Black'
	| 'BlanchedAlmond'
	| 'Blue'
	| 'BlueViolet'
	| 'Brown'
	| 'BurlyWood'
	| 'CadetBlue'
	| 'Chartreuse'
	| 'Chocolate'
	| 'Coral'
	| 'CornflowerBlue'
	| 'Cornsilk'
	| 'Crimson'
	| 'Cyan'
	| 'DarkBlue'
	| 'DarkCyan'
	| 'DarkGoldenRod'
	| 'DarkGray'
	| 'DarkGrey'
	| 'DarkGreen'
	| 'DarkKhaki'
	| 'DarkMagenta'
	| 'DarkOliveGreen'
	| 'DarkOrange'
	| 'DarkOrchid'
	| 'DarkRed'
	| 'DarkSalmon'
	| 'DarkSeaGreen'
	| 'DarkSlateBlue'
	| 'DarkSlateGray'
	| 'DarkSlateGrey'
	| 'DarkTurquoise'
	| 'DarkViolet'
	| 'DeepPink'
	| 'DeepSkyBlue'
	| 'DimGray'
	| 'DimGrey'
	| 'DodgerBlue'
	| 'FireBrick'
	| 'FloralWhite'
	| 'ForestGreen'
	| 'Fuchsia'
	| 'Gainsboro'
	| 'GhostWhite'
	| 'Gold'
	| 'GoldenRod'
	| 'Gray'
	| 'Grey'
	| 'Green'
	| 'GreenYellow'
	| 'HoneyDew'
	| 'HotPink'
	| 'IndianRed'
	| 'Indigo'
	| 'Ivory'
	| 'Khaki'
	| 'Lavender'
	| 'LavenderBlush'
	| 'LawnGreen'
	| 'LemonChiffon'
	| 'LightBlue'
	| 'LightCoral'
	| 'LightCyan'
	| 'LightGoldenRodYellow'
	| 'LightGray'
	| 'LightGrey'
	| 'LightGreen'
	| 'LightPink'
	| 'LightSalmon'
	| 'LightSeaGreen'
	| 'LightSkyBlue'
	| 'LightSlateGray'
	| 'LightSlateGrey'
	| 'LightSteelBlue'
	| 'LightYellow'
	| 'Lime'
	| 'LimeGreen'
	| 'Linen'
	| 'Magenta'
	| 'Maroon'
	| 'MediumAquaMarine'
	| 'MediumBlue'
	| 'MediumOrchid'
	| 'MediumPurple'
	| 'MediumSeaGreen'
	| 'MediumSlateBlue'
	| 'MediumSpringGreen'
	| 'MediumTurquoise'
	| 'MediumVioletRed'
	| 'MidnightBlue'
	| 'MintCream'
	| 'MistyRose'
	| 'Moccasin'
	| 'NavajoWhite'
	| 'Navy'
	| 'OldLace'
	| 'Olive'
	| 'OliveDrab'
	| 'Orange'
	| 'OrangeRed'
	| 'Orchid'
	| 'PaleGoldenRod'
	| 'PaleGreen'
	| 'PaleTurquoise'
	| 'PaleVioletRed'
	| 'PapayaWhip'
	| 'PeachPuff'
	| 'Peru'
	| 'Pink'
	| 'Plum'
	| 'PowderBlue'
	| 'Purple'
	| 'RebeccaPurple'
	| 'Red'
	| 'RosyBrown'
	| 'RoyalBlue'
	| 'SaddleBrown'
	| 'Salmon'
	| 'SandyBrown'
	| 'SeaGreen'
	| 'SeaShell'
	| 'Sienna'
	| 'Silver'
	| 'SkyBlue'
	| 'SlateBlue'
	| 'SlateGray'
	| 'SlateGrey'
	| 'Snow'
	| 'SpringGreen'
	| 'SteelBlue'
	| 'Tan'
	| 'Teal'
	| 'Thistle'
	| 'Tomato'
	| 'Turquoise'
	| 'Violet'
	| 'Wheat'
	| 'White'
	| 'WhiteSmoke'
	| 'Yellow'
	| 'YellowGreen'

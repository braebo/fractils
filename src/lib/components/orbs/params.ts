import { Color } from '../../color/color'
import { state } from '../../utils/state'

const count = 10
const defaults = {
	orbs: 50,
	size: 5,
	floop: 0.01,
	a1: 1,
	a2: 1,
	drift: 0,
	modulate: true,
	width: count * 10,
	height: count * 10,
	speed: 0.02,
	mid: count * 5,
	brightness: 0.4,
	color: new Color({ r: 10, g: 200, b: 250, a: 1 }),
	accent: new Color({ r: 0, g: 50, b: 100, a: 1 }),
	glowR: 10,
	glowG: 10,
	glowB: 50,
	nested: {
		glow: {
			r: 10,
			g: 10,
			b: 50,
		},
	}
}

export type Params = typeof defaults
export const params = state(defaults)

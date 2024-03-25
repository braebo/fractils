type LeftRight = 'left' | 'right'
type LRC = LeftRight | 'center'

type TopBottom = 'top' | 'bottom'
type TBC = TopBottom | 'center'

export type Placement = 'center' | `${TBC}-${LRC}` | `${LRC}-${TBC}`

type VirtualRect = Record<string, any> & {
	x: number
	y: number
	width: number
	height: number
}

export type Vec2 = { x: number; y: number }

export interface PlacementOptions {
	/**
	 * The bounding box to place the element within.  Can be a
	 * DOMRect, custom {@link VirtualRect}, or `'window'`.
	 * @default 'window'
	 */
	bounds?: DOMRect | VirtualRect | 'window'
	/**
	 * The margin in pixels to apply to the placement.  Can be a number
	 * to apply the same margin to both x and y, or an object with x
	 * and y properties to apply different margins to each axis.
	 * @default 16
	 */
	margin?: number | Vec2
}

/**
 * Determines the x and y position of an element relative to
 * a bounding box based on a given {@link Placement} string.
 * Optional {@link PlacementOptions} can be provided to specify
 * the bounding box and a margin.
 *
 * @example
 * ```ts
 * const { x, y } = place(node, 'top-right', { bounds: window, margin: 10 })
 * ```
 */
export function place(
	node: DOMRect | VirtualRect | (Record<string, any> & { width: number; height: number }),
	placement = 'top-right',
	options?: PlacementOptions,
): Vec2 {
	console.log({ placement, options, node })
	const { bounds, margin } = Object.assign(
		{
			bounds: undefined as VirtualRect | undefined,
			margin: 10 as number | Vec2,
		},
		options,
	)

	const b =
		bounds === 'window' && typeof window !== 'undefined'
			? { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
			: bounds ?? { x: 0, y: 0, width: 100, height: 100 }

	const m = typeof margin === 'number' ? { x: margin, y: margin } : margin

	if (!('x' in m) || !('y' in m)) {
		throw new Error('Invalid margin: ' + JSON.stringify(m))
	}

	// prettier-ignore
	switch (placement) {
		case ('center'):
		case ('center-center'): return { x: b.width / 2 - node.width / 2, y: b.height / 2 - node.height / 2 }
		case ('top-left'):
		case ('left-top'): return { x: m.x, y: m.y }
		case ('top-center'):
		case ('center-top'): return { x: b.width / 2 - node.width / 2, y: m.y }
		case ('top-right'):
		case ('right-top'): return { x: b.width - node.width - m.x, y: m.y }
		case ('bottom-left'):
		case ('left-bottom'): return { x: m.x, y: b.height - node.height - m.y }
		case ('bottom-center'):
		case ('center-bottom'): return { x: b.width / 2 - node.width / 2, y: b.height - node.height - m.y }
		case ('bottom-right'):
		case ('right-bottom'): return { x: b.width - node.width - m.x, y: b.height - node.height - m.y }
		case ('left-center'):
		case ('center-left'): return { x: m.x, y: b.height / 2 - node.height / 2 }
		case ('right-center'):
		case ('center-right'): return { x: b.width - node.width - m.x, y: b.height / 2 - node.height / 2 }
        default: throw new Error('Invalid placement: ' + placement)
	}
}

/**
 * This was the original implementation of the place function before
 * I realized it could just be a switch statement.  My crude benchmark
 * shows that the switch statement is about 94.83% faster than this one.
 * Leaving here for posterity.
 * @deprecated
 */
export function place_old(
	node: HTMLElement,
	placement = 'bottom-center',
	options = {
		bounds: undefined as VirtualRect | undefined,
		margin: 10 as number | Vec2,
	} as PlacementOptions,
) {
	let { bounds, margin } = options

	const margins = { x: 0, y: 0 }

	if (typeof margin === 'number') {
		margins.x = margin
		margins.y = margin
	}

	if (typeof margin === 'object') {
		margins.x = margin.x
		margins.y = margin.y
	}

	if (!bounds || bounds === 'window') {
		if (typeof window !== 'undefined') {
			bounds = {
				x: 0,
				y: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			}
		} else {
			bounds = { x: 0, y: 0, width: 0, height: 0 }
		}
	}

	if (placement === 'center') {
		return {
			x: bounds.width / 2 - node.offsetWidth / 2,
			y: bounds.height / 2 - node.offsetHeight / 2,
		}
	}

	let [a, b] = placement.split('-') as [TBC, LRC] | [LRC, TBC]

	let a_axis: 'x' | 'y'
	let b_axis: 'x' | 'y'

	const resolveSide = (s: TBC | LRC, axis?: 'x' | 'y'): number => {
		switch (s) {
			case 'top': {
				return margins.y
			}
			case 'bottom': {
				return bounds.height - node.offsetHeight - margins.y
			}
			case 'left': {
				return margins.x
			}
			case 'right': {
				return bounds.width - node.offsetWidth - margins.x
			}
		}

		if (s === 'center' && axis) {
			if (axis === 'x') {
				return bounds.width / 2 - node.offsetWidth / 2
			} else {
				return bounds.height / 2 - node.offsetHeight / 2
			}
		}

		throw new Error(
			'Failed to resolve axis for side ' +
				s +
				' and axis ' +
				axis +
				' for placement ' +
				placement,
		)
	}

	if (isCenter(a) || isCenter(b)) {
		if (isCenter(a)) {
			if (isCenter(b)) {
				return {
					x: resolveSide('center', 'x'),
					y: resolveSide('center', 'y'),
				}
			}

			b_axis = getAxis(b)
			a_axis = otherAxis(b_axis)

			if (a_axis === b_axis) {
				throw new Error('Failed to resolve axis, both resolved to ' + a_axis)
			}

			return {
				[a_axis]: resolveSide(a, a_axis),
				[b_axis]: resolveSide(b),
			} as Vec2 // I feel like ts shouldn't be trippin here..
		}

		if (isCenter(b)) {
			a_axis = getAxis(a)
			b_axis = otherAxis(a_axis)

			if (a_axis === b_axis) {
				throw new Error('Failed to resolve axis, both resolved to ' + a_axis)
			}

			return {
				[a_axis]: resolveSide(a),
				[b_axis]: resolveSide(b, b_axis),
			} as Vec2
		}

		throw new Error('Failed to resolve center placement')
	} else {
		if (typeof b === 'undefined') {
			b = ['top', 'bottom'].includes(a) ? 'left' : 'top'
		}

		a_axis = getAxis(a)
		b_axis = getAxis(b)

		return {
			[a_axis]: resolveSide(a),
			[b_axis]: resolveSide(b),
		} as Vec2
	}

	function getAxis(s: ('top' | 'bottom') | ('left' | 'right')) {
		if (['top', 'bottom'].includes(s)) {
			return 'y'
		} else {
			return 'x'
		}
	}

	function otherAxis<T extends 'x' | 'y'>(s: T): T extends 'x' ? 'y' : 'x' {
		// @ts-ignore  --\_(0_o)_/--  ._.  o__O  .__.  --\_(0_o)_/--
		return s === 'x' ? 'y' : 'x'
	}

	function isCenter(s: any): s is 'center' {
		return s === 'center'
	}
}

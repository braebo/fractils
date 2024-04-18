export type Placement = 'center' | `${TBC}-${LRC}` | `${LRC}-${TBC}`

type LeftRight = 'left' | 'right'
type LRC = LeftRight | 'center'

type TopBottom = 'top' | 'bottom'
type TBC = TopBottom | 'center'

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

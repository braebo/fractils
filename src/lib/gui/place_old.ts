import type { Vec2, PlacementOptions } from '../dom/place'

type LeftRight = 'left' | 'right'
type LRC = LeftRight | 'center'

type TopBottom = 'top' | 'bottom'
type TBC = TopBottom | 'center'

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
	options?: PlacementOptions,
) {
	let { bounds = undefined, margin = 10 } = options || {}

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

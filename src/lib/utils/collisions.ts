/**
 *  X || Y distance to closest Element.
 */

/**
 * Represents a dom element's bounding rectangle.
 */
export type VirtualRect = {
	left: number
	top: number
	right: number
	bottom: number
}

/**
 * Checks for collision with {@link obstacleEls obstacles} to determine the maximum distance
 * the draggable can move in the x direction.
 *
 * @returns The maximum distance the draggable can move in the x direction (`deltaX`) before
 * colliding with an obstacle.  If no collision is detected, the full distance (`targetX`)
 * is returned.  If the draggable is already colliding with an obstacle, `0` is returned.
 */

export const collisionClampX = (
	deltaX: number,
	nodeRect: VirtualRect,
	obstacles: Array<HTMLElement>,
) => {
	const { top, bottom, left, right } = nodeRect
	// moving right > 0
	if (deltaX > 0) {
		for (const obstacle of obstacles) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || already passed || unreachable with delta
			if (top > o.bottom || bottom < o.top || right > o.left)
				//|| right + deltaX <= o.left)
				continue
			deltaX = Math.min(deltaX, o.left - right)
		}
		// if (boundsRect) deltaX = Math.min(deltaX, boundsRect.right - right)
	} else {
		for (const obstacle of obstacles) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || already passed || unreachable with delta
			if (top > o.bottom || bottom < o.top || left < o.right)
				//|| left + deltaX >= o.right)
				continue
			deltaX = Math.max(deltaX, o.right - left)
		}
		// if (boundsRect) deltaX = Math.max(deltaX, boundsRect.left - left)
	}
	return deltaX
}

export const collisionClampY = (
	deltaY: number,
	nodeRect: VirtualRect,
	obstacles: Array<HTMLElement>,
	// boundsRect?: VirtualRect,
) => {
	const { top, bottom, left, right } = nodeRect

	if (deltaY > 0) {
		// Moving down.
		for (const obstacle of obstacles) {
			const o = obstacle.getBoundingClientRect()
			// too far left || too far right || already passed || unreachable with delta
			if (left > o.right || right < o.left || bottom > o.top)
				//|| bottom + deltaY <= o.top)
				continue
			deltaY = Math.min(deltaY, o.top - bottom)
		}
		// if (boundsRect) deltaY = Math.min(deltaY, boundsRect.bottom - bottom)
	} else {
		// Moving up.
		for (const obstacle of obstacles) {
			const o = obstacle.getBoundingClientRect()
			// too far left || too far right || already passed || unreachable with delta
			if (left > o.right || right < o.left || top < o.bottom)
				//|| top + deltaY >= o.bottom)
				continue
			deltaY = Math.max(deltaY, o.bottom - top)
		}
		// if (boundsRect) deltaY = Math.max(deltaY, boundsRect.top - top)
	}
	return deltaY
}

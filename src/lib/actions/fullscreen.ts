import type { Action } from 'svelte/action'
import { logger } from '../utils/logger'

declare global {
	interface Document {
		webkitExitFullscreen?: () => Promise<void>
		webkitFullscreenElement?: Element
	}

	interface HTMLElement {
		webkitRequestFullscreen?: () => Promise<void>
	}
}

export function fullscreenSupported() {
	return 'webkitRequestFullscreen' in document.body || 'requestFullscreen' in document.body
}

export function fullscreenEnabled() {
	return document.fullscreenElement !== null || document.webkitFullscreenElement !== null
}

export function fullscreenEnter() {
	if ('webkitRequestFullscreen' in document.body) {
		document.body.webkitRequestFullscreen!()
	} else if ('requestFullscreen' in document.body) {
		document.body.requestFullscreen!()
	}
}

export function fullscreenExit() {
	if ('webkitExitFullscreen' in document) {
		document.webkitExitFullscreen!()
	} else if ('exitFullscreen' in document) {
		document.exitFullscreen!()
	}
}

export function fullscreenToggle() {
	if (fullscreenEnabled()) {
		fullscreenExit()
	} else {
		fullscreenEnter()
	}
}

export interface FullscreenOptions {
	button?: HTMLElement
	size?: number
	dimTime?: number
	hideTime?: number
	fadeDuration?: number
	debug?: boolean
}

export const fullscreen: Action = (node, options?: FullscreenOptions) => {
	if (!fullscreenSupported()) {
		return
	}

	// node.addEventListener('click', fullscreenToggle)

    if (options?.button) {
        options.button.addEventListener('click', fullscreenToggle)
    } else {
        node.addEventListener('click', fullscreenToggle)
    }

	return {
		destroy() {
			node.removeEventListener('click', fullscreenToggle)
		},
	}
}

/**
 * Creates a button that toggles fullscreen mode.
 */
export class FullscreenButton {
	state: 'visible' | 'dimmed' | 'hidden' = 'visible'
	enabled = false
	debug = false

	size = 30
	btn?: HTMLElement

	opacity = {
		hidden: 0,
		dim: 0.3,
		visible: 0.8,
	}

	/**
	 * How long to wait after showing the button
	 * before entering it's dimmed state.
	 */
	dimTime = 1500
	dimTimer?: ReturnType<typeof setTimeout>

	/**
	 * How long to wait after dimming the button
	 * before hiding it completely.
	 */
	hideTime = 2000
	hideTimer?: ReturnType<typeof setTimeout>

	/**
	 * Animation transition duration.
	 */
	fadeDuration = 1000

	#log = this.debug ? logger('Fullscreen') : (..._args: any[]) => void 0

	// These are assigned in the constructor based on browser support.
	enterFullscreen: () => void = () => void 0
	exitFullscreen: () => void = () => void 0

	maximizePath =
		'M8 3 H 5 a 2 2 0 0 0-2 2 v 3 m 18 0 V 5 a 2 2 0 0 0 -2 -2 h -3 m 0 18 h 3 a 2 2 0 0 0 2 -2 v -3 M 3 16 v 3 a 2 2 0 0 0 2 2 h 3'
	minimizePath =
		'M 8 3 v 3 a 2 2 0 0 1 -2 2 H 3 m 18 0 h -3 a 2 2 0 0 1 -2 -2 V 3 m 0 18 v -3 a 2 2 0 0 1 2 -2 h 3 M 3 16 h 3 a 2 2 0 0 1 2 2 v 3'

	toSvg = (d: string, name: 'minimize' | 'maximize') => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.classList.add(name)
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
		svg.setAttribute('viewBox', '0 0 24 24')
		svg.setAttribute('width', '100%')
		svg.setAttribute('height', '100%')
		svg.setAttribute('fill', 'none')
		svg.setAttribute('stroke-width', '0.75')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('d', d)

		svg.appendChild(path)

		svg.style.position = 'absolute'
		svg.style.transition = 'opacity 0.15s'

		return svg
	}

	maximize = this.toSvg(this.maximizePath, 'maximize')
	minimize = this.toSvg(this.minimizePath, 'minimize')

	constructor(
		/**
		 * If provided, no ui will be created,
		 * and the element will be used instead.
		 */
		public element?: HTMLElement,
	) {
		/**
		 * We need to branch for webkit-specific fullscreen API's before anything else.
		 * If neither are supported, we can just bail out.
		 */
		if ('webkitRequestFullscreen' in document.body) {
			this.enterFullscreen = () => {
				document.body.webkitRequestFullscreen!()
			}
			this.exitFullscreen = () => {
				document.webkitExitFullscreen!()
			}
			window.addEventListener('webkitfullscreenchange', this.onWebkitFullscreenChange)
		} else if ('requestFullscreen' in document.body) {
			this.enterFullscreen = () => {
				document.body.requestFullscreen!()
			}
			this.exitFullscreen = () => {
				document.exitFullscreen!()
			}
			window.addEventListener('fullscreenchange', this.onFullscreenChange)
		} else {
			this.#log('This browser does not support fullscreen.')
			return
		}

		this.btn = this.element ?? this.createButton()

		// Toggle fullscreen on click.
		this.btn.addEventListener('click', this.toggleFullscreen)
		// Show the button on mouseover.
		this.btn.addEventListener('mouseover', this.show, { passive: true })
		// Or if mobile, on touch.
		window.addEventListener('touchstart', this.show, { passive: true })
		// Dim the button when the mouse moves anywhere on the window.
		window.addEventListener('mousemove', this.dimUnlessVisible, { passive: true })
		// Toggle Fullscreen on double click anywhere.
		window.addEventListener('dblclick', this.toggleFullscreen)

		setTimeout(() => {
			this.show()
		}, 100)
	}

	onFullscreenChange = () => {
		this.setOrToggleState(document.fullscreenElement !== null)
	}

	onWebkitFullscreenChange = () => {
		this.setOrToggleState(document.webkitFullscreenElement !== null)
	}

	show = () => {
		this.#log('show()')
		this.clearTimeouts()

		this.btn?.style.setProperty('opacity', String(this.opacity.visible))
		this.state = 'visible'

		this.startDimTimer()
	}

	hide = () => {
		this.#log('hide()')
		this.clearTimeouts()

		this.btn?.style.setProperty('opacity', '0')
		this.state = 'hidden'
	}

	dim = () => {
		this.#log('dim()')
		this.clearTimeouts()

		this.btn?.style.setProperty('opacity', String(this.opacity.dim))

		this.hideTimer = setTimeout(() => {
			this.hide()
		}, this.hideTime)
	}

	dimUnlessVisible = () => {
		this.#log('dimUnlessVisible()')

		if (this.state !== 'visible') {
			this.dim()
		}
	}

	startDimTimer = () => {
		this.#log('startDimTimer()')

		this.dimTimer = setTimeout(() => {
			this.dim()
		}, this.dimTime)
	}

	setOrToggleState(state?: boolean) {
		this.#log('toggleIcons()')

		this.enabled = state ?? !this.enabled

		if (state) {
			this.swapOutFade(this.maximize)
			this.swapInFade(this.minimize)
		} else {
			this.swapOutFade(this.minimize)
			this.swapInFade(this.maximize)
		}
	}

	toggleFullscreen = () => {
		this.#log('toggle()')
		this.setOrToggleState()

		if (this.enabled) {
			this.enterFullscreen()
			this.dim()
		} else {
			this.exitFullscreen()
		}
	}

	swapInFade(el: SVGElement) {
		el.style.transitionDelay = `0.075s`
		el.style.opacity = '1'
	}

	swapOutFade(el: SVGElement) {
		el.style.transitionDelay = '0s'
		el.style.opacity = '0'
	}

	createButton() {
		this.#log('createButton()')
		const btn = document.createElement('button')
		btn.id = 'fullscreen-btn'

		btn.style.appearance = 'none'
		btn.style.all = 'unset'
		btn.style.display = 'flex'
		btn.style.position = 'fixed'
		btn.style.bottom = '1.5rem'
		btn.style.right = '1.5rem'
		btn.style.color = 'white'
		btn.style.pointerEvents = 'fill'
		btn.style.cursor = 'pointer'
		btn.style.zIndex = '3'

		btn.style.width = `${this.size}px`
		btn.style.height = `${this.size}px`
		btn.style.opacity = `${this.opacity.visible}`
		btn.style.transition = `opacity ${this.fadeDuration}ms`

		this.minimize.style.opacity = '0'

		btn.appendChild(this.maximize)
		btn.appendChild(this.minimize)

		document.body.appendChild(btn)

		return btn
	}

	clearTimeouts = () => {
		this.#log('clearTimeouts()')
		clearTimeout(this.dimTimer)
		clearTimeout(this.hideTimer)
	}

	removeListeners() {
		this.#log('removeListeners()')

		this.btn?.removeEventListener('click', this.toggleFullscreen)
		this.btn?.removeEventListener('mouseover', this.show)
		window.removeEventListener('touchstart', this.show)
		window.removeEventListener('mousemove', this.dimUnlessVisible)

		if ('webkitRequestFullscreen' in document.body) {
			window.removeEventListener('webkitfullscreenchange', this.onWebkitFullscreenChange)
		}

		if ('requestFullscreen' in document.body) {
			window.removeEventListener('fullscreenchange', this.onFullscreenChange)
		}

		window.removeEventListener('dblclick', this.toggleFullscreen)
	}

	dispose = () => {
		this.btn?.remove()
		this.clearTimeouts()
		this.removeListeners()
	}
}

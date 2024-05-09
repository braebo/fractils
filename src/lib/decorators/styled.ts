import { create } from '../utils/create'

export const styled = createStyledDecorator()

function createStyledDecorator() {
	return function <T extends { new (...args: any[]): {}; style: string }>(constructor: T) {
		return class extends constructor {
			static initialized = false
			static stylesheet: HTMLStyleElement

			constructor(...args: any[]) {
				super(...args)

				if (typeof globalThis.document !== 'undefined') {
					const dis = this.constructor as typeof constructor & {
						initialized: boolean
						stylesheet?: HTMLStyleElement
					}

					if (!dis.style || dis.initialized) {
						return
					}

					dis.initialized = true

					dis.stylesheet ??= create('style', {
						parent: document.head,
						innerHTML: dis.style,
					})
				} else {
					throw new Error('@styled components can only be used in the browser')
				}
			}
		}
	}
}

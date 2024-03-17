import { nanoid } from './nanoid'

/**
 * Represents an event manager that provides methods for adding and removing event listeners.
 */
export class EventManager {
	listeners = new Map<string, () => void>()

	/**
	 * Adds an event listener to an element.
	 * @param element - The element to add the listener to.
	 * @param event - The event to listen for.
	 * @param callback - The callback function to execute when the event is fired.
	 * @param options - Optional event listener options.
	 */
	listen = (
		element: HTMLElement | Window | Document,
		event: GlobalEventHandlersEventMap | (string & {}),
		callback: (...args: any[]) => void,
		options?: AddEventListenerOptions,
	): void => {
		const id = nanoid()
		element.addEventListener(event as unknown as string, callback, options)
		this.listeners.set(id, () => {
			element.removeEventListener(event as unknown as string, callback, options)
		})
	}

	add = (cb: () => void) => {
		const id = nanoid()
		this.listeners.set(id, cb)
		return id
	}

	/**
	 * Removes a specific listener from the event manager
	 * without removing the listener from the element.
	 */
	ignore(id: string): boolean {
		return this.listeners.delete(id)
	}

	/**
	 * Removes all registered listeners from the
	 * element and clears the event manager.
	 */
	clear(): void {
		for (const cb of this.listeners.values()) cb()
		this.listeners.clear()
	}

	/**
	 * Removes all registered listeners.
	 */
	dispose(): void {
		this.clear()
	}
}

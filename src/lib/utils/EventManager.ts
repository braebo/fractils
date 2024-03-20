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
	listen = <
		TTarget extends Element | Window | Document,
		TEventName extends keyof GlobalEventHandlersEventMap | (string & {}),
		TEventInstance extends TEventName extends keyof GlobalEventHandlersEventMap
			? GlobalEventHandlersEventMap[TEventName] & { target: TTarget }
			: Event,
	>(
		element: TTarget,
		event: TEventName,
		callback: (e: TEventInstance) => void,
		options?: AddEventListenerOptions,
	): void => {
		const id = nanoid()
		element.addEventListener(event, callback as EventListener, options)
		this.listeners.set(id, () => {
			element.removeEventListener(event, callback as EventListener, options)
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

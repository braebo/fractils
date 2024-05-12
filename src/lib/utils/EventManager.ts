import { Logger } from './logger'
import { nanoid } from './nanoid'

export type EventCallback<T = any> = (...args: T[]) => void

/**
 * Represents an event manager that provides methods for adding and removing event listeners.
 */

export class EventManager<EventMap extends Record<string, any>> {
	private _listeners = new Map<string, EventCallback>()
	private _handlers = new Map<
		keyof EventMap,
		Map<string, EventCallback<EventMap[keyof EventMap]>>
	>()
	private _log = new Logger('EventManager', { fg: 'beige' })

	constructor(events?: Array<keyof EventMap>) {
		if (events) {
			this.registerEvents([...events])
		}
	}

	registerEvents(events: Array<keyof EventMap>) {
		for (const event of events) {
			this._handlers.set(event, new Map())
		}
	}

	on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): string {
		this._log.fn('on').debug('new listener:', { event, callback })

		const id = nanoid()
		const listeners = this._handlers.get(event) as Map<string, EventCallback<EventMap[K]>>

		if (!this._handlers.has(event)) {
			console.warn(`Event "${String(event)}" is not registered.`)
			return ''
		}

		listeners.set(id, callback)
		return id
	}

	// emit(event: keyof EventMap, ...args: Parameters<EventCallback>) {
	// 	for (const cb of this.handlers.get(event)?.values() ?? []) {
	// 		cb(...args)
	// 	}
	// }
	emit<K extends keyof EventMap>(event: K, ...args: EventMap[K][]) {
		const callbacks = this._handlers.get(event)
		if (callbacks) {
			for (const cb of callbacks.values()) {
				cb(...args)
			}
		}
	}

	clearAll() {
		for (const listeners of this._handlers.values()) listeners.clear()
		this._handlers.clear()
	}

	/**
	 * Adds an event listener to an HTMLElement that will be removed when {@link dispose} is called.
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
	) => {
		const id = nanoid()
		element.addEventListener(event, callback as EventCallback, options)
		this._listeners.set(id, () => {
			element.removeEventListener(event, callback as EventCallback, options)
		})
		return id
	}

	/**
	 * Adds a listener to the event manager without attaching it to an element.
	 * @param cb - The callback function to execute when the event is fired.
	 */
	add = (cb: () => void) => {
		const id = nanoid()
		this._listeners.set(id, cb)
		return id
	}

	/**
	 * Removes a listener from the event manager without removing the listener from the element.
	 */
	unlisten(id: string): boolean {
		return this._listeners.delete(id)
	}

	/**
	 * Removes all registered listeners from the element and clears the event manager.
	 */
	clear(): void {
		for (const cb of this._listeners.values()) cb()
		this._listeners.clear()
	}

	/**
	 * Removes all registered listeners.
	 */
	dispose(): void {
		this.clear()
		this.clearAll()
	}
}

// const test = new EventManager(['change', 'click', 'foo'])
// test.on('click', () => {})
// test.emit('click')
// test.registerEvents(['change'])

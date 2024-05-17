import { Logger } from './logger'
import { nanoid } from './nanoid'

export type EventCallback<T = any> = (...args: T[]) => void

/**
 * Represents an event manager that provides methods for adding and removing event listeners.
 */
export class EventManager<EventMap extends Record<string, any>> {
	private _unlisteners = new Map<string, EventCallback>()
	/**
	 * The event handlers for each registered custom event type, and their respective callbacks.
	 */
	private _handlers = new Map<
		keyof EventMap,
		Map<string, EventCallback<EventMap[keyof EventMap]>>
	>()
	private _listenerGroups = new Map<string, Set<string>>()
	private _log = new Logger('EventManager', { fg: 'beige' })

	constructor(events?: Array<keyof EventMap>) {
		if (events) {
			this.registerEvents([...events])
		}
	}

	/**
	 * Register new event type(s) for use via {@link on}.
	 */
	registerEvents(events: Array<keyof EventMap>) {
		for (const event of events) {
			this._handlers.set(event, new Map())
		}
	}

	/**
	 * Register a new event listener.
	 * @param event - The name of the event to listen for.
	 * @param callback - The callback function to execute when the event is fired.
	 * @returns The ID of the listener (for use via {@link unlisten} to remove the listener).
	 */
	on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): string {
		this._log.fn('on').debug(this)

		if (!this._handlers.has(event)) {
			this._log.warn(`Event "${String(event)}" is not registered.`, this)
			return ''
		}

		this._log.debug('new listener:', { event, callback })

		const id = nanoid()
		const listeners = this._handlers.get(event) as Map<string, EventCallback<EventMap[K]>>

		listeners.set(id, callback)
		return id
	}

	/**
	 * Emit an event to all registered listeners.
	 * @param event - The name of the event to emit.
	 * @param args - The arguments to pass to the event listeners.
	 */
	emit<K extends keyof EventMap>(event: K, ...args: EventMap[K][]) {
		this._log.fn('emit').debug({ event })
		const callbacks = this._handlers.get(event)
		if (callbacks) {
			for (const cb of callbacks.values()) {
				cb(...args)
			}
		}
	}

	/**
	 * Add an event listener to an HTMLElement that will be removed when {@link dispose} is called.
	 * @param element - The element to add the listener to.
	 * @param event - The event to listen for.
	 * @param callback - The callback function to execute when the event is fired.
	 * @param options - Optional event listener options.
	 * @param groupId - Optional group ID to add the listener to (for batch removal).
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
		groupId?: string,
	) => {
		const id = nanoid()
		element.removeEventListener(event, callback as EventCallback, options)
		element.addEventListener(event, callback as EventCallback, options)
		this._unlisteners.set(id, () => {
			element.removeEventListener(event, callback as EventCallback, options)
		})

		if (groupId) this.group(groupId, id)

		return id
	}

	/**
	 * Add a listener to the event manager without attaching it to an element.
	 * @param cb - The callback function to execute when the event is fired.
	 * @param groupId - Optional group ID to add the listener to (for batch
	 * removal via {@link clearGroup}).
	 * @returns The ID generated for the listener (for removal via {@link unlisten}).
	 */
	add = (cb: () => void, groupId?: string) => {
		const id = nanoid()
		this._unlisteners.set(id, cb)

		if (groupId) this.group(groupId, id)

		return id
	}

	/**
	 * Add a listener to a group by id, enabling batch removal via {@link clearGroup}.
	 * @param groupId - The ID of the group to add the listener ID to.
	 * @param listenerId - The ID of the listener to add to the group.
	 */
	group(groupId: string, listenerId: string) {
		if (!this._listenerGroups.has(groupId)) {
			this._listenerGroups.set(groupId, new Set())
		}
		this._listenerGroups.get(groupId)!.add(listenerId)
		return this
	}

	/**
	 * Call the listener callback with the specified ID, then remove it.
	 * @param id - The ID of the listener to remove.
	 * @returns `true` if the listener was removed, `false` if it was not found.
	 */
	unlisten(id: string): boolean {
		this._unlisteners.get(id)?.()
		return this._unlisteners.delete(id)
	}

	/**
	 * Calls all cleanup callbacks and clears the event manager.
	 */
	clear() {
		for (const cb of this._unlisteners.values()) cb()
		this._unlisteners.clear()
		this._listenerGroups.clear()
		this.clearHandlers()
		return this
	}

	/**
	 * Remove all registered event handlers.
	 */
	clearHandlers() {
		for (const listeners of this._handlers.values()) listeners.clear()
		this._handlers.clear()
		return this
	}

	/**
	 * Remove all listeners in a group by ID.
	 * @param groupId - The ID of the group to clear.
	 */
	clearGroup(groupId: string) {
		const group = this._listenerGroups.get(groupId)
		if (group) {
			for (const id of group) {
				const cb = this._unlisteners.get(id)
				if (cb) cb()
				this._unlisteners.delete(id)
			}
			this._listenerGroups.delete(groupId)
		}
		return this
	}

	/**
	 * Removes all registered listeners.
	 */
	dispose(): void {
		this.clear()
		this.clearHandlers()
	}
}

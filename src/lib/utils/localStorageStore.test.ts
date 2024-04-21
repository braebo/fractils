import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { localStorageStore } from './localStorageStore'
import { get } from 'svelte/store'

describe('localStorageStore', async () => {
	beforeEach(() => {
		localStorage.clear()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should initialize with the initial value if nothing in localStorage', () => {
		const testStore = localStorageStore('testKey', 10)
		expect(get(testStore)).toBe(10)
	})

	it('should initialize with the value from localStorage if present', async () => {
		localStorage.setItem('testKey', JSON.stringify(20))
		const testStore = localStorageStore('testKey', 10, { browserOverride: true })
		expect(get(testStore)).toBe(20)
	})

	it('should update the value in localStorage when set', () => {
		const testStore = localStorageStore('testKey', 10)
		testStore.set(30)
		expect(localStorage.getItem('testKey')).toBe(JSON.stringify(30))
	})
})

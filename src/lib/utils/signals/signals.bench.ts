import { signal as signalOg } from './signals-og'
import { signal as signalNew } from './signals'
import { describe, bench } from 'vitest'

describe('signals', () => {
	bench('og', () => {
		const s = signalOg('foo')

		let x = s.value

		const unsub = s.subscribe(v => {
			x = v
		})
		if (x) {}

		s.value = 'bar'

		unsub()
	})

	bench('new', () => {
		const s = signalNew('foo')

		let x = s.value

		const unsub = s.subscribe(v => {
			x = v
			if (x) {}
		})

		s.value = 'bar'

		unsub()
	})
})

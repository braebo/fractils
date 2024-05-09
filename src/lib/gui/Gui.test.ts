// todo

import { describe, expect, it } from 'vitest'

import { Gui } from './Gui'

describe('Gui', () => {
	const gui = new Gui({
		title: 'Test Gui',
	})

	const folder = gui.addFolder({
		
	})

	// prettier-ignore
	describe('Gui.add', () => {
		it('should generate the correct inputs', () => {
			const x = folder.add({//=>
				value: 5,
			})
			expect(x.__type).toBe('InputNumber')
		
			const y = folder.add({//=>
				value: false,
			})
			expect(y.__type).toBe('InputSwitch')

		})
		
		
	})

	expect(folder).toBeDefined()
})

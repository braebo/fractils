import { test, expect } from 'vitest'

test('InputSelect', () => {
	expect('todo').toBe('todo')
})

// import { describe, expect, it, beforeEach, test } from 'vitest'
// import { isState, state } from '../../utils/state'
// import { Gui } from '../Gui'

// // cases to test:
// // for both bound and unbound, test:
// // Raw Value | State<Raw Value> | LabeledOption<Raw Value> | State<LabeledOption<Raw Value>>

// const gui = new Gui()

// const RAW_VALUE = 1
// const RAW_OPTIONS = [RAW_VALUE, 2]

// const LABELED_VALUE = { label: '1', value: RAW_VALUE }
// const LABELED_OPTIONS = [LABELED_VALUE, { label: '2', value: 2 }]

// const DEFS = {
// 	RAW_RAW: {
// 		value: RAW_VALUE,
// 		options: RAW_OPTIONS,
// 	},
// 	RAW_LABELED: {
// 		value: RAW_VALUE,
// 		options: LABELED_OPTIONS,
// 	},
// 	LABELED_RAW: {
// 		value: LABELED_VALUE,
// 		options: RAW_OPTIONS,
// 	},
// 	LABELED_LABELED: {
// 		value: LABELED_VALUE,
// 		options: LABELED_OPTIONS,
// 	},
// 	StateRAW_RAW: {
// 		value: state(RAW_VALUE),
// 		options: RAW_OPTIONS,
// 	},
// 	StateRAW_LABELED: {
// 		value: state(RAW_VALUE),
// 		options: LABELED_OPTIONS,
// 	},
// 	StateLABELED_RAW: {
// 		value: state(LABELED_VALUE),
// 		options: RAW_OPTIONS,
// 	},
// 	StateLABELED_LABELED: {
// 		value: state(LABELED_VALUE),
// 		options: LABELED_OPTIONS,
// 	},
// 	RAW_StateRAW: {
// 		value: RAW_VALUE,
// 		options: RAW_OPTIONS,
// 	},
// 	RAW_StateLABELED: {
// 		value: RAW_VALUE,
// 		options: LABELED_OPTIONS,
// 	},
// 	LABELED_StateRAW: {
// 		value: LABELED_VALUE,
// 		options: RAW_OPTIONS,
// 	},
// 	LABELED_StateLABELED: {
// 		value: LABELED_VALUE,
// 		options: LABELED_OPTIONS,
// 	},
// 	StateRAW_StateRAW: {
// 		value: state(RAW_VALUE),
// 		options: RAW_OPTIONS,
// 	},
// 	StateRAW_StateLABELED: {
// 		value: state(RAW_VALUE),
// 		options: LABELED_OPTIONS,
// 	},
// 	StateLABELED_StateRAW: {
// 		value: state(LABELED_VALUE),
// 		options: RAW_OPTIONS,
// 	},
// 	StateLABELED_StateLABELED: {
// 		value: state(LABELED_VALUE),
// 		options: LABELED_OPTIONS,
// 	},
// } as const

// // function valueFormat(value: any) {
// // 	return value === RAW_VALUE ? 'raw' : 'labeled'
// // }

// function testDef(key: keyof typeof DEFS) {
// 	describe(key, () => {
// 		const def = DEFS[key]
// 		const { value, options } = def

// 		if ('error' in def) {
// 			it('should throw an error', () => {
// 				expect(() => {
// 					gui.addSelect({ value, options })
// 				}).toThrow()
// 			})
// 			return
// 		}

// 		const select = gui.addSelect({ value, options })

// 		const v = isState(value) ? value.value : value

// 		it('should have the correct `valueFormat`', () => {
// 			expect(select.valueFormat).toStrictEqual(v === RAW_VALUE ? 'raw' : 'labeled')
// 		})

// 		it('should have the correct `initialValue`', () => {
// 			expect(select.initialValue).toStrictEqual(v)
// 		})

// 		it('should have the correct `state.value`', () => {
// 			expect(select.state.value).toStrictEqual(v)
// 		})

// 		it('should have the correct `labeledSelection`', () => {
// 			expect(select.labeledSelection).toStrictEqual(LABELED_VALUE)
// 		})

// 		it('should have the correct `options`', () => {
// 			expect(JSON.stringify(select.options)).toStrictEqual(JSON.stringify(options))
// 		})

// 		it('should have the correct `value` after a new selection', () => {
// 			select.set
// 		})
// 	})
// }

// describe('InputSelect', () => {
// 	for (const key in DEFS) {
// 		testDef(key as keyof typeof DEFS)
// 	}

// 	it("should use opts.binding.initial if opts.value isn't provided", () => {
// 		const params = {
// 			foo: {
// 				bar: 'baz',
// 			},
// 		}

// 		const select = gui.addSelect({
// 			options: ['baz', 'qux'],
// 			binding: {
// 				target: params.foo,
// 				key: 'bar',
// 			},
// 		})

// 		console.log(select.options)

// 		expect(select.state.value).toStrictEqual('baz')
// 	})

// 	it("should use opts.binding.initial if opts.value isn't provided", () => {
// 		const params = {
// 			a: {
// 				b: 0,
// 			},
// 		}

// 		const select = gui.addSelect({
// 			options: [
// 				{ label: 'baz', value: 1 },
// 				{ label: 'qux', value: 2 },
// 			],
// 			binding: {
// 				target: params.a,
// 				key: 'b',
// 				initial: { label: 'foo', value: 0 },
// 			},
// 		})

// 		console.log(select.options)

// 		// select.set({ label: 'baz', value: 1 })

// 		expect(select.state.value).toStrictEqual(1)
// 	})
// })

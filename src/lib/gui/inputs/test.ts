// import type { Writable } from 'svelte/store'

// interface InputOptions<T> {
// 	title: string
// 	value: T
// }

// interface NumberInputOptions extends InputOptions<number> {
// 	min: number
// 	max: number
// }

// interface ColorInputOptions extends InputOptions<string> {
// 	mode: 'rgba' | 'hsla' | 'hex'
// }

// abstract class Input<T, O extends InputOptions<unknown>> {
// 	declare state: Writable<T>
// 	title: string

// 	constructor(options: O) {
// 		this.title = options.title
// 	}
// }

// export class NumberInput extends Input<number, NumberInputOptions> {
// 	min: number
// 	max: number

// 	constructor(options: NumberInputOptions) {
// 		super(options)
// 		this.min = options.min
// 		this.max = options.max
// 	}
// }

// export class ColorInput extends Input<string, ColorInputOptions> {
// 	mode: 'rgba' | 'hsla' | 'hex'

// 	constructor(options: ColorInputOptions) {
// 		super(options)
// 		this.mode = options.mode
// 	}
// }

// type ValidOptions = NumberInputOptions | ColorInputOptions

// type InputFactory<T = ValidOptions> = (
// 	options: T extends NumberInputOptions ? NumberInputOptions : ColorInputOptions,
// ) => T extends NumberInputOptions ? NumberInput : ColorInput

// /**
//  * This function accepts InputOptions and returns the corresponding Input instance.
//  * It can infer the type of InputOptions and Input instance based on the options.
//  * Subsequently, it the consumer is not required to provide a generic type.
//  */
// export const createInput: InputFactory<unknown> = <T extends ValidOptions>(options: T) => { // Type '<T extends ValidOptions>(options: T) => NumberInput | ColorInput' is not assignable to type 'InputFactory<unknown>'.  Type 'NumberInput | ColorInput' is not assignable to type 'ColorInput'.  Property 'mode' is missing in type 'NumberInput' but required in type 'ColorInput'.
// 	if ('min' in options) {
// 		return new NumberInput(options)
// 	} else {
// 		return new ColorInput(options)
// 	}
// }

// const numberInput = createInput({
// 	title: 'Number',
// 	value: 10, // Type 'number' is not assignable to type 'string'.
// 	min: 0,
// 	max: 100,
// })

import type { Writable } from 'svelte/store'

interface InputOptions<T> {
	title: string
	value: T
}

interface NumberInputOptions extends InputOptions<number> {
	min: number
	max: number
}

interface ColorInputOptions extends InputOptions<string> {
	mode: 'rgba' | 'hsla' | 'hex'
}

abstract class Input<T, O extends InputOptions<unknown>> {
	declare state: Writable<T>
	title: string

	constructor(options: O) {
		this.title = options.title
	}
}

export class NumberInput extends Input<number, NumberInputOptions> {
	min: number
	max: number

	constructor(options: NumberInputOptions) {
		super(options)
		this.min = options.min
		this.max = options.max
	}
}

export class ColorInput extends Input<string, ColorInputOptions> {
	mode: 'rgba' | 'hsla' | 'hex'

	constructor(options: ColorInputOptions) {
		super(options)
		this.mode = options.mode
	}
}

type ValidOptions = NumberInputOptions | ColorInputOptions
type ValidInput = NumberInput | ColorInput

type InputType<T> = T extends NumberInputOptions
	? NumberInput
	: T extends ColorInputOptions
		? ColorInput
		: never

export function createInput(options: NumberInputOptions): NumberInput
export function createInput(options: ColorInputOptions): ColorInput
export function createInput(options: ValidOptions): ValidInput {
	if ('min' in options && 'max' in options) {
		return new NumberInput(options)
	} else if ('mode' in options) {
		return new ColorInput(options)
	} else {
		throw new Error('Invalid input options')
	}
}

// export function createInput<T extends ValidOptions>(options: T): InputType<T> {
// 	if ('min' in options && 'max' in options) {
// 		return new NumberInput(options) as InputType<T>
// 	} else if ('mode' in options) {
// 		return new ColorInput(options) as InputType<T>
// 	} else {
// 		throw new Error('Invalid input options')
// 	}
// }

const numberInput = createInput({
	title: 'Number',
	value: 10,
	min: 0,
	max: 100,
	// mode: 'rgba', // This should error.
	// foo: 'bar',
})

numberInput.state.set(0)

const colorInput = createInput({
	title: 'Color',
	value: '#ff0000',
	mode: 'hex',
})

const params = {
	background: '#ff0000',
	dimensions: {
		width: 100,
		height: 100,
	},
}

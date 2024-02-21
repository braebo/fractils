type InputType = 'Number' | 'String' | 'Boolean'

interface NumberInputOptions {
	min: number
	max: number
	step: number
}

interface StringInputOptions {
	maxLength?: number
}

interface BooleanInputOptions {}

// prettier-ignore
type InferInputOptions<T extends InputType, V> = 
	T extends 'Number' ? V extends number ? NumberInputOptions : never :
	T extends 'String' ? V extends string ? StringInputOptions : never :
	T extends 'Boolean' ? V extends boolean ? BooleanInputOptions : never :
	{};

// prettier-ignore
type InferInputType<V> =
	V extends number ? 'Number' :
	V extends string ? 'String' :
	V extends boolean ? 'Boolean' :
	never

type InputOptions<V, T extends InputType = InferInputType<V>> = {
	title: string
	value: V
	type?: T
} & InferInputOptions<T, V>

export class Input {
	constructor() {}
	add<V, T extends InputType = InferInputType<V>>(options: InputOptions<V, T>) {}
}

// ✅ Correct Error: missing min/max/step
new Input().add({ title: 'Slider 2', value: 0.5, type: 'Number' })

// ✅ Correct Error: missing min/max/step
new Input().add({ title: 'Slider 1', value: 0.5 })

new Input().add({ title: 'Textbox 1', value: 'asdas' })
new Input().add({ title: 'Textbox 2', value: 'asdas', type: 'String' })

// ✅ Correct Error: type mismatch
// todo - (how can we add a more helpful error message?)
new Input().add({ title: 'Textbox 1', value: false, type: 'Number' })

// ✅ Correct Error: type mismatch
// todo - (how can we add a more helpful error message?)
new Input().add({ title: 'Textbox 1', value: false, type: 'Number', min: 0, max: 10, step: 1 })

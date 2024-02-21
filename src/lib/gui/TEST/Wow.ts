export type InputType = 'Number' | 'String' | 'Boolean'

export interface NumberInputOptions {
	min?: number
	max?: number
	step?: number
}

export interface StringInputOptions {
	maxLength?: number
}

export interface BooleanInputOptions {}

// prettier-ignore
type InferInputOptions<T extends InputType, V> = 
    T extends 'Number' ? V extends number ? NumberInputOptions : 'Value must be a number for Number inputs.' :
    T extends 'String' ? V extends string ? StringInputOptions : 'Value must be a string for String inputs.' :
    T extends 'Boolean' ? V extends boolean ? BooleanInputOptions : 'Value must be a boolean for Boolean inputs.' :
    never;

// prettier-ignore
type InferInputType<V> =
    V extends number ? 'Number' :
    V extends string ? 'String' :
    V extends boolean ? 'Boolean' :
    never;

export type InputOptions<V, T extends InputType = InferInputType<V>> = {
	title: string
	value: V
	type?: T
} & InferInputOptions<T, V>

export class FolderTEST {
	constructor() {}
	add<V, T extends InputType = InferInputType<V>>(options: InputOptions<V, T>) {}
}

// new FolderTEST().add({ title: 'Slider 2', value: 0.5, type: 'Number' })
// new FolderTEST().add({ title: 'Slider 1', value: 0.5 })

// new FolderTEST().add({ title: 'Textbox 1', value: 'asdas' })
// new FolderTEST().add({ title: 'Textbox 2', value: 'asdas', type: 'String' })

// // ✅ Correct Error: type mismatch with custom error message.
// new FolderTEST().add({ title: 'Textbox 1', value: false, type: 'Number' })

// // ✅ Correct Error: type mismatch with custom error message.
// new FolderTEST().add({ title: 'Textbox 1', value: false, type: 'Number' })

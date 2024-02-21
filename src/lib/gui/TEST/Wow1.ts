type InputType = 'Number' | 'String' | 'Boolean'

interface NumberInputOptions {
    min: number;
    max: number;
    step: number;
}

type IsUnion<T, U extends T = T> =
    (T extends any ?
    (U extends T ? false : true)
        : never) extends false ? false : true

type InferInputOptions<T extends InputType> = IsUnion<T> extends true ? {} : T extends 'Number' ? NumberInputOptions : {}

type InferInputType<V, RT extends InputType | never> = V extends number ? 'Number' : V extends string ? 'String' : RT

type InputOptions<V, T extends InputType = InferInputType<V, InputType>> = {
	title: string
	value: V
} & (InferInputType<V, never> extends never ? { type: T } : { type?: T }) 
& InferInputOptions<T>

export class Input {
	constructor() {}
	add<V, T extends InputType>(options: InputOptions<V, T>) {}
}

// todo fix problem with inferring the type

new Input().add({ title: 'Slider 2', value: 0.5, type: 'Number', }) // Correct Error:
                                                                    // Argument of type '{ title: string; value: number; type: "Number"; }' is not assignable to parameter of type 'InputOptions<number, "Number">'.
                                                                    // Type '{ title: string; value: number; type: "Number"; }' is missing the following properties from type 'NumberInputOptions': min, max, stepts(2345)

new Input().add({ title: 'Slider 1', value: 0.5,  }) // min/max/step are missing, but there's no error

new Input().add({ title: 'Textbox 1', value: 'asdas', })
new Input().add({ title: 'Textbox 2', value: 'asdas', type: 'String',  })

new Input().add({ title: 'Textbox 1', value: false, type: 'Number',  }) // Incorrect Error:
                                                                        // Argument of type '{ title: string; value: false; type: "Number"; }' is not assignable to parameter of type 'InputOptions<boolean, "Number">'.
                                                                        //     Type '{ title: string; value: false; type: "Number"; }' is missing the following properties from type 'NumberInputOptions': min, max, stepts(2345)

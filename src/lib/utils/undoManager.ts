import { deepMerge } from './deepMerge'
import { nanoid } from './nanoid'
import { isObject } from './is'
import { wait } from './wait'

function clone<T>(v: T): T {
	return isObject(v) ? structuredClone(v) : v
}

interface UMRT<V> {
	key: string
	initial: V
	apply: (v: V) => void
}

export class UndoManager {
	pointer = 0
	maxHistory = 50
	stack: { key: string; value: any }[] = []
	umrts: Record<string, UMRT<any>> = {}

	constructor() {}

	undo() {
		// If is wrong we are at the start so don't do anything.
		if (this.pointer === -1) return

		// Find the key of the current item, this is what we are undoing.
		const currentKey = this.stack[this.pointer].key
		const umrt = this.umrts[currentKey]

		// move the pointer back.
		this.pointer--

		// Find the last good value in the stack.
		const previousValueIndex = this.stack
			.slice(0, this.pointer + 1)
			.findLastIndex((value) => value.key === currentKey)

		// Use the ops fn to set to last good value.
		umrt.apply(previousValueIndex === -1 ? umrt.initial : this.stack[previousValueIndex])

		console.log('\nundo:', {
			value: previousValueIndex === -1 ? umrt.initial : this.stack[previousValueIndex],
			stackSize: this.stack.length,
			newPointer: this.pointer,
		})
	}

	redo() {
        // if pointer is less than stack move forward
        // find new value and call it's umrt apply.
    }

	register<V>(data: Omit<UMRT<V>, 'key'>) {
		const key = nanoid()

		this.umrts[key] = { key, apply: data.apply, initial: clone(data.initial) }

		return (value: V) => {
			if (this.stack.length > this.maxHistory) {
				this.stack.shift()
			}

			this.stack.push({ key, value: clone(value) })
			this.pointer = this.stack.length - 1
		}
	}
}

let foo = {
	bar: 'ba',
}

let bar = {
	baz: 10,
}

const undoManager = new UndoManager()

const pushFoo = undoManager.register({
	initial: foo,
	// apply: (v) => (foo = v),
	apply: (v) => {
        foo = v
    },
})

function doStuff() {
	
	pushFoo(foo)
	console.log('\npush:', {
		foo,
	})
}

async function main() {
	doStuff()
	await wait(1000)
    undoManager.undo()
    await wait(1000)
	doStuff()
}

main()

// x: 10
// y: asd
// z: { a: 2 }

// x y y x z y x z z
//                 ^

// new UndoManager((v) => (value = v))

// const um = new UndoManager()

// const op = um.add('foo', {
//     initial: foo,
//     do_op: () => (foo = 'bar'),
// })

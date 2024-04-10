import type { Folder } from '../Folder'

import { create, type CreateOptions } from '../../utils/create'
import { entries } from '../../utils/object'

type Preset = Record<string, any>

export class PresetManager {
	presets = new Map<string, Preset>()

	constructor(public folder: Folder) {}

	save(presetName: string) {
		const preset = {} as Preset

		for (const [id, controller] of this.folder.allControls) {
			preset[id] = controller.state.value
		}

		this.presets.set(presetName, preset)
	}

	load(presetName: string) {
		const preset = this.presets.get(presetName)
		if (!preset) {
			// todo - toasts?
			// this.folder.root.toasts.set('Preset not found', 'error')
			return
		}

		for (const [id, _value] of entries(preset)) {
			const controller = this.folder.controls.get(id)
			if (!controller) continue

			// controller.state.set(value)
		}
	}
}

interface ElementOptions {
	namespace?: string
	classes?: string[]
}

class Elements<const ContainerType extends HTMLElement = HTMLElement> {
	ns: string
	classes: string[]

	constructor(
		public container: ContainerType,
		options?: ElementOptions,
	) {
		this.classes = options?.classes ?? []
		this.ns = options?.namespace ?? 'fracgui'
	}

	addClasses() {
		for (const el of entries(this)) {
			if (el instanceof HTMLElement) {
				el.classList.add(...this.classes)
			}
		}
	}
}

export class PresetManagerElements extends Elements {
	save: HTMLButtonElement
	load: HTMLButtonElement
	preset: HTMLSelectElement
	presetName: HTMLInputElement
	duplicate: HTMLButtonElement
	delete: HTMLButtonElement
	export: HTMLButtonElement
	import: HTMLButtonElement

	constructor(container: HTMLElement) {
		super(container, {
			namespace: 'fracgui-presetmanager',
			classes: ['fracgui-controller', 'fracgui-button'],
		})

		const { ns } = this

		this.save = create('button', 'save')
		this.load = create('button', 'load')

		this.load = create('button', { parent: container, classes: [`${ns}-load`] })
		this.preset = create('select', { parent: container, classes: [`${ns}-preset`] })
		this.presetName = create('input', { parent: container, classes: [`${ns}-presetName`] })
		this.duplicate = create('button', { parent: container, classes: [`${ns}-duplicate`] })
		this.delete = create('button', { parent: container, classes: [`${ns}-delete`] })
		this.export = create('button', { parent: container, classes: [`${ns}-export`] })
		this.import = create('button', { parent: container, classes: [`${ns}-import`] })
	}

	create<const T extends Parameters<typeof create>[0], const O extends CreateOptions>(
		tagname: T,
		scope: string,
		options = {} as O,
	) {
		this.container
		options.parent ??= this.container
		options.classes ??= []

		return create(tagname, {
			...options,
			classes: ['fracgui-' + scope, ...options.classes.map(c => `${this.ns}=${scope}-${c}`)],
		})
	}
}

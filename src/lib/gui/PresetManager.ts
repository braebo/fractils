import type { Folder, FolderPreset } from './Folder'
import type { State } from '../utils/state'

import { code } from '../../routes/demo/gui/demoGui'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'

export class PresetManager {
	#presetSnapshot?: FolderPreset
	activePreset = state({} as FolderPreset)
	presets: State<FolderPreset[]>
	parentFolder: Folder
	folder: Folder
	#log: Logger

	constructor(
		parentFolder: Folder,
		options: {
			/**
			 * Optionsal existing presets.
			 * @default []
			 */
			presets?: FolderPreset[]

			/**
			 * The default preset to use.
			 * @default undefined
			 */
			defaultPreset?: FolderPreset

			/**
			 * The key to use for storage.  If not provided, storage is disabled.
			 * @default undefined
			 */
			storageKey?: string
		},
	) {
		this.parentFolder = parentFolder
		this.#log = new Logger(`PresetManager ${parentFolder.title}`, { fg: 'slateblue' })
		this.#log.fn('constructor').info({ options, this: this })

		this.presets = state(options.presets ?? [], {
			key: options.storageKey,
		})

		this.folder = this.#createPresetsFolder(parentFolder, options.defaultPreset)
	}

	set(value: FolderPreset) {
		this.activePreset.set(value)
	}

	#renamePreset(title: string) {
		this.#log.fn('#renamePreset').info({ this: this, title })
		this.presets.update(presets => {
			const preset = presets.find(p => p.presetId === this.activePreset.value.presetId)
			if (!preset) throw new Error('No preset found.')

			preset.presetTitle = title
			// presets.set(this.activePreset.value.presetId, preset)
			presets = presets.map(p =>
				p.presetId === this.activePreset.value.presetId ? preset : p,
			)

			return presets
		})
	}

	#createPresetsFolder(parentFolder: Folder, defaultPreset?: FolderPreset) {
		this.#log.fn('#createPresetsFolder').info({ this: this, parentFolder, defaultPreset })
		const presetsFolder = parentFolder.addFolder({
			title: 'presets',
			//! closed: true,
			closed: false,
			hidden: true,
			children: [],
		})
		const root = parentFolder.root
		const presetTitle = presetsFolder.addText({
			title: 'title',
			value: 'preset' + (this.presets.value.length ? ` (${this.presets.value.length})` : ''),
		})
		presetTitle.on('change', v => {
			console.log(v)
			// const curr = this.presets.value.get(v)
			// if (saveBtn) {
			// 	if (curr) {
			// 		console.log('preset exists', v)
			// 		saveBtn.element.innerText = 'overwrite'
			// 	} else {
			// 		saveBtn.element.innerText = 'save'
			// 	}
			// }
			// if (curr && this.activePresetId.value === curr.presetId) {
			// 	renameBtn?.element.classList.add('disabled')
			// }
		})

		const btnGrid = presetsFolder.addButtonGrid({
			title: 'manage',
			value: [
				[
					{
						label: 'save',
						// onClick: () => {
						// 	const preset = root.save(presetTitle.value)
						// 	// console.log(preset)
						// 	code.set(`const preset = ${JSON.stringify(preset, null, 2)}`)
						// 	this.presets.push(preset)
						// 	// console.log(this.presets.value)
						// },
					},
					{
						label: 'rename',
						onClick: () => {
							this.#renamePreset(presetTitle.value)
						},
					},
					{
						label: 'delete',
						onClick: () => {},
					},
				],
			],
		})

		const saveBtn = btnGrid.buttons.get('save')
		// const renameBtn = btnGrid.buttons.get('rename')
		// const deleteBtn = btnGrid.buttons.get('delete')

		// Let the folders load before saving the default preset.
		Promise.resolve().then(() => {
			defaultPreset ??= this.presets.value.find(p => p.presetId === 'fracgui-default-preset')

			if (!defaultPreset) {
				defaultPreset = root.save('default') as FolderPreset //...
				defaultPreset.presetId = 'fracgui-default-preset'
				this.presets.push(defaultPreset)
			}

			if (!Object.keys(this.activePreset.value).length) {
				this.activePreset.set(defaultPreset)
			}

			root.evm.add(
				this.activePreset.subscribe(v => {
					if (v.presetId === this.activePreset.value.presetId) return
					root.load(v)
				}),
			)

			const presetSelectInput = presetsFolder.addSelect({
				__type: 'SelectInputOptions',
				title: 'presets',
				options: () => this.presets.value,
				labelKey: 'presetTitle',
				value: this.activePreset.value,
				// onChange: v => {
				// console.log(v)
				// this.parentFolder.load(v.value)
				// },
			})

			saveBtn?.on('click', payload => {
				payload //=>
				console.log(payload)
				const preset = root.save(presetTitle.value)
				// console.log(preset)
				code.set(`const preset = ${JSON.stringify(preset, null, 2)}`)

				const existing = this.presets.value.find(p => p.presetId === preset.presetId)
				if (!existing) {
					this.presets.push(preset)
				} else {
					console.log('preset exists. replacing.', preset.presetId)
					this.presets.update(presets => {
						const index = presets.findIndex(p => p.presetId === preset.presetId)
						presets[index] = preset
						return presets
					})
				}

				// console.log('presetSelectInput.options', presetSelectInput.options)

				// presetSelectInput.options = this.presets.value

				presetSelectInput.refresh()

				// console.log('presetSelectInput.options', presetSelectInput.options)
			})

			presetSelectInput.on('change', v => {
				this.#log.fn('on(change)').info(v)
				root.load(v.value)
			})
			presetSelectInput.on('open', () => {
				this.#log.fn('on(open)').info()
				this.#presetSnapshot = this.parentFolder.root.save('snapshot')
			})
			presetSelectInput.on('cancel', () => {
				this.#log.fn('on(cancel)').info()
				if (this.#presetSnapshot) {
					this.parentFolder.root.load(this.#presetSnapshot)
				}
			})
		})

		return presetsFolder
	}
}

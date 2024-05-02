// import type { Folder, FolderOptions, FolderPreset } from '../Folder'
// import type { State } from '../../utils/state'

// import { state } from '../../utils/state'
// import { Gui } from '../Gui'

// export class PresetManager {
// 	presets: State<Map<string, FolderPreset>>
// 	activePresetId = state('')

// 	constructor(public folder: Folder, key: string) {
// 		this.presets = state(new Map(), { key })
// 	}

// 	save(presetTitle?: string) {
// 		const data: FolderPreset = {
// 			presetId: this.folder.presetId,
// 			closed: this.folder.closed.value,
// 			hidden: this.folder.hidden,
// 			children: this.folder.children
// 				.filter(c => c.title !== Gui.settingsFolderTitle)
// 				.map(child => child.root.presetManager.save()),
// 			controllers: Array.from(this.folder.inputs.values()).map(input => input.save()),
// 		}

// 		if (this.folder.isGui()) {
// 			if (!presetTitle) {
// 				throw new Error('Root folder must have a preset title.')
// 			}
// 			data.presetTitle = presetTitle
// 		}

// 		return data
// 	}

// 	load(preset: FolderPreset) {
// 		this.folder.closed.set(preset.closed)
// 		this.folder.hidden = preset.hidden
// 		for (const child of this.folder.children) {
// 			const data = preset.children.find(f => f.presetId === child.presetId)
// 			if (data) child.presetManager.load(data)
// 		}
// 		for (const input of this.folder.inputs.values()) {
// 			const data = preset.controllers.find(c => c.presetId === input.presetId)
// 			if (data) input.load(data)
// 		}

// 		if (this.folder.isGui()) {
// 			this.folder.activePresetId.set(preset.presetId)
// 		}
// 	}

// 	renamePreset(title: string) {
// 		this.presets.update(presets => {
// 			const preset = presets.get(this.activePresetId.value)
// 			if (!preset) throw new Error('No preset found.')

// 			preset.presetTitle = title
// 			presets.set(this.activePresetId.value, preset)

// 			return presets
// 		})
// 	}
// }

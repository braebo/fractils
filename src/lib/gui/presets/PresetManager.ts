import { create } from '$lib/utils/create'
import type { Gui } from '../Gui'
import { Input, type InputOptions } from '../inputs/Input'

// interface PresetManagerElements

type Preset = Record<string, any>

export class PresetManager {
	presets: Map<string, Preset> = new Map()

	constructor(public gui: Gui) {}

	load() {}
}

export type ButtonItem = {
	text: string
	onClick: () => void
}

export type ButtonGridControllerOptions = {
	items: ButtonItem[][]
}

export type ButtonId = string

export class InputButtons {
	buttons = new Map<ButtonId, HTMLButtonElement>()

	elements: {
		container: HTMLDivElement
		buttons: HTMLButtonElement[]
	}

	constructor(
		public parent: HTMLElement,
		public options: ButtonGridControllerOptions,
	) {
		InputButtons.init()

		const container = create('div', {
			classes: ['fracgui-controller', 'fracgui-controller-buttons-container'],
		})

		this.elements = {
			container,
			get buttons() {
				return Array.from(this.buttons)
			},
		}
	}

	addButton(id: ButtonId, text: string, onClick: () => void) {
		const button = create('button', {
			classes: ['fracgui-controller-buttons-button'],
			text,
			parent: this.elements.container,
		})

		button.addEventListener('click', onClick)

		this.buttons.set(id, button)
	}

	static initialized = false
	static init() {
		if (this.initialized) return
		this.initialized = true

		const style = document.createElement('style')
		style.textContent = this.style
		document.head.appendChild(style)
	}
	static style = /*css*/ `
        .fracgui-controller-buttons-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5em;
        }
        .fracgui-controller-buttons-button {
            padding: 0.5em 1em;
            margin: 0.25em;
            border: none;
            background-color: #333;
            color: white;
            cursor: pointer;
        }
    `
}

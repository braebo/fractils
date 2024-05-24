import type { Tooltip } from '../../actions/tooltip'
import type { Folder } from '../Folder'

import { styled } from '../../decorators/styled'
import { create } from '../../utils/create'

@styled
export class TerminalSvg {
	class = 'fracgui-terminal-icon'
	element: HTMLElement & { tooltip: Tooltip }
	classes = [this.class, 'fracgui-cancel']

	constructor(folder: Folder) {
		const parent = folder.isRoot ? folder.elements.header : folder.elements.title
		if (folder.isRoot) this.classes.push('fracgui-terminal-icon-root')
		this.element = create('div', {
			parent,
			classes: this.classes,
			innerHTML: /*html*/ `
                <svg class="icon terminal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" x2="20" y1="19" y2="19"></line>
                </svg>
                `.replaceAll(/\t|\n/g, ''),
			tooltip: {
				text: '<code>console.log(folder)</code>',
				delay: 1500,
				placement: 'right',
			},
			onclick: e => {
				e.stopPropagation()
				e.preventDefault()
				console.log(folder)
			},
		})
	}

	static style = /*css*/ `
        .fracgui-terminal-icon {
            position: absolute;
            right: -1.5rem;
            top: 0;
            bottom: 0;

            width: 16px;
            height: 16px;

            color: var(--fracgui-fg-d);
            transform: translateY(15%);
            opacity: 0;

            transition: opacity 0.2s;
            transition-delay: 0.5s;

            z-index: 1;
        }

        .fracgui-terminal-icon-root {
            right: unset;
            left: 0.5rem;
            top: 0.25rem;
        }


        .fracgui-terminal-icon:hover {
            opacity: 0.75;
        }

        .fracgui-terminal-icon svg {
            width: 100%;
            height: 100%;
        }
    `
}

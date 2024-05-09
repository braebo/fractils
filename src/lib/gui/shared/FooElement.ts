//- Hypothetical component api
// @ts-nocheck

import type { CreateOptions } from '../../utils/create'

import { styled } from '../../decorators/styled'

@component
export class TerminalSvg {
	declare element: HTMLElementTagNameMap[this['tagname']] // this would go in the base class.

	class = 'fracgui-terminal-icon'
	tagname = 'div' as const
	onclick = (e: PointerEvent) => {
		e.stopPropagation()
		console.log(this)
	}

	constructor(opts: CreateOptions) {
		super(opts)
	}

	static style = /*css*/ `
        .fracgui-terminal-icon {
            position: absolute;
            right: -1.5rem;
            top: 0;
            bottom: 0;
            width: 16px;
            height: 16px;
            transform: translateY(15%);
            opacity: 0;
        }

        .fracgui-terminal-icon:hover {
            opacity: 1;
        }

        .fracgui-terminal-icon svg {
            width: 100%;
            height: 100%;
        }

        .fracgui-terminal-icon svg .icon {
            stroke: var(--fracgui-fg-c);
        }

        .fracgui-terminal-icon svg .icon:hover {
            stroke: var(--fracgui-theme-a);
        }
    `
}

import type { Tooltip } from '../../actions/tooltip'

import { styled } from '../../decorators/styled'
import { create } from '../../utils/create'

@styled
export class SaveSVG {
	element: HTMLElement & { tooltip: Tooltip }

	constructor() {
		this.element = create('div', {
			classes: ['fracgui-icon-save', 'fracgui-icon'],
			innerHTML: /*html*/ `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <g class="Frame">
                        <path class="back-group" fill="currentColor" fill-rule="evenodd" d="M6.127 21A3.496 3.496 0 0 0 9 22.5h10a3.5 3.5 0 0 0 3.5-3.5V9c0-1.19-.593-2.24-1.5-2.873V7.5c.314.418.5.937.5 1.5v10a2.5 2.5 0 0 1-2.5 2.5H9a2.489 2.489 0 0 1-1.5-.5H6.127Z" class="Subtract" clip-rule="evenodd"/>
                        <rect width="16" height="16" x="3" y="3" fill="currentColor" stroke-width="1.5" class="front" rx="2"/>
                        <g class="plus">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M11 8v7" class="vertical"/>
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M14.5 11.5h-7" class="horizontal"/>
                        </g>
                    </g>
                </svg>
            `.replaceAll(/\t|\n/g, ''),
		}) as HTMLElement & { tooltip: Tooltip }
	}

	static style = /*css*/ `
        .fracgui-icon-save {
            width: 1.5rem;
            height: 1.5rem;

            color: var(--fracgui-controller-dim_color);
            margin-right: 0.25rem;
            opacity: 0.5;

            transition: opacity 0.15s;

            z-index: 1;
            cursor: pointer;
        }

        .fracgui-icon-save:hover {
            opacity: 1;
        }

        .fracgui-icon-save .back-group {
            transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition-property: opacity, transform;
            transition-delay: 0s;
            
            opacity: 0;
            transform: translate(-0.25rem, -0.25rem);
        }
        .fracgui-icon-save:hover .back-group {
            opacity: 1;
            transition-delay: 0.25s;
            transform: translate(0, 0);
        }

        .fracgui-icon-save .plus {
            transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition-property: color, transform;
            transform-origin: center;

            transform: scale(1.5);
        }
        .fracgui-icon-save:hover .plus {
            transform: scale(1);
            color: var(--fracgui-bg-a);
        }

        .fracgui-icon-save .front {
            transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition-property: transform, opacity;

            transform: scale(1.25);
            opacity: 0;
        }
        .fracgui-icon-save:hover .front {
            transform: scale(1);
            opacity: 1;
        }

        .fracgui-icon-save svg {
            width: 100%;
            height: 100%;
        }
    `
}

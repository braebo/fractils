import { styled } from '../../decorators/styled'
import { Tooltip } from '../../actions/tooltip'
import { create } from '../../utils/create'

@styled
export class RenameSVG {
	class = 'fracgui-icon-rename'
	element: HTMLElement & { tooltip: Tooltip }
	classes = [this.class, 'fracgui-icon']

	constructor() {
		this.element = create('div', {
			classes: this.classes,
			innerHTML: /*html*/ `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" >
                    <path class="cursor top" fill="none" stroke="currentColor" d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1" vector-effect="non-scaling-stroke"></path>
                    <path class="cursor bottom"fill="none" stroke="currentColor" d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5" vector-effect="non-scaling-stroke"></path>
                    <rect class="box full" fill="currentColor" stroke="none" x="1" y="8" width="18" height="8" rx="2" vector-effect="non-scaling-stroke"></rect>
                    <path class="cursor middle"fill="none" stroke="currentColor" d="M9 7v10" vector-effect="non-scaling-stroke"></path>
                </svg>
            `.replaceAll(/\t|\n/g, ''),
		}) as HTMLElement & { tooltip: Tooltip }
	}

	static style = /*css*/ `
        .fracgui-icon-rename {
            width: 1.5rem;
            height: 1.5rem;

            margin-right: 0.5rem;
            padding: 0.125rem;

            color: var(--fracgui-controller-dim_color);
            opacity: 0.5;

            transition: opacity 0.15s;

            z-index: 1;
            cursor: pointer;

            pointer-events: all;
        }

        .fracgui-icon-rename:hover {
            opacity: 1;
        }

        .fracgui-icon-rename svg {
            width: 100%;
            height: 100%;

            pointer-events: none;
        }

        .fracgui-icon-rename path {
            color: var(--fracgui-controller-dim_color);
            /* stroke: var(--fracgui-controller-dim_color); */
        }
        .fracgui-icon-rename .cursor {
            transform: translate(2px, 0) scale(1, 0.9);

            transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition-delay: 0s;
            transition-property: opacity, transform;
            transform-origin: center;
        }
        .fracgui-icon-rename:hover .cursor, .fracgui-icon-rename.active .cursor {
            transform: translate(0, 0);
            transform: translate(0, 0) scale(1, 0.9);
        }
        .fracgui-icon-rename.active .cursor {
            color: var(--fracgui-theme-a);
            animation: blink 1.5s infinite;
            animation-delay: 0.5s;
        }

        @keyframes blink {
            0%, 45%, 80% {
                opacity: 1;
            }
            50%, 75% {
                opacity: 0;
            }
        }

        .fracgui-icon-rename .box {
            color: var(--fracgui-folder-dim_color);

            opacity: 0;
            transform: scale(0);

            transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition-property: opacity, transform;
            transform-origin: center;
        }
        .fracgui-icon-rename:hover .box, .fracgui-icon-rename.active .box {
            opacity: 0.25;
            transform: scale(1.1);
            color: var(--fracgui-controller_color);
        }
        .fracgui-icon-rename:hover .box {
            transform: scale(1);
        }
        
        .fracgui-icon-rename.disabled {
            opacity: 0;
            pointer-events: none;
            cursor: default;
        }
    `
}

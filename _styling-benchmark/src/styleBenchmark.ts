export async function main(
	el: HTMLButtonElement,
	{ iterations = 100000, cb = (() => void 0) as (name: string, time: number) => void },
) {
	const results = new Map<string, number>()

	// What's faster?

	const opts = {
		setProperty: () => el.style.setProperty('color', 'red'),
		color: () => (el.style.color = 'red'),
		cssText: () => (el.style.cssText = 'color:red;'),
		stylesheet: () => {
			const style = document.createElement('style')
			style.innerHTML = gigaSheet + /*css*/ `
h1 {
  color: ${['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'][Math.floor(Math.random() * 10)]};
}`
			document.head.appendChild(style)
		},
	}

	for (const [name, fn] of Object.entries(opts)) {
		const count = name === 'stylesheet' ? 1 : iterations
		await run(fn, count).then(async time => {
			cb(name, time)
			results.set(name, time)
			await new Promise(resolve => setTimeout(resolve, 1000))
		})
	}

	async function run(fn: () => void, count = iterations) {
		const start = performance.now()
		for (let i = 0; i < count; i++) {
			fn()
		}
		return performance.now() - start
	}

	return results
}

export const gigaSheet = `
@charset "UTF-8";
.fracgui-root {
  --fracgui-font: "Kodchasan", sans-serif;
  --fracgui-root-header-font-size: 0.75rem;
  --fracgui-root-header-height: 1.75rem;
  --header-height: 1.75rem;
  --fracgui-width: 30rem;
  --fracgui-min-width: 25rem;
  --fracgui-max-width: 35rem;
  --fracgui-input-height: 2rem;
  --fracgui-input-section-1-width: 6rem;
  --fracgui-input-section-2-width: 4rem;
  --fracgui-input-section-3-width: 100%;
  --fracgui-alpha: 0.5;
  --fracgui-blur: .2rem;
  --shadow-lightness: 1;
}

.fracgui-root,
.fracgui-root[theme=default],
.fracgui-root[theme=minimal] {
  --fracgui-root-content-background: rgba(var(--bg-b-rgb), 0.3);
  --fracgui-root-shadow: 0 0 1.5px 0.5px rgba(var(--bg-d-rgb), 0.5) inset;
  --fracgui-folder-background: rgba(var(--bg-b-rgb), 0.5);
  --fracgui-folder-header-width: 100%;
  --fracgui-folder-header-padding-left: 0.25rem;
  --fracgui-folder-header-color: var(--fg-c);
  --fracgui-folder-header-background: var(--bg-a);
  --fracgui-folder-header-outline: none;
  --fracgui-folder-header-border-radius: var(--radius-sm);
  --fracgui-folder-header-box-shadow: none;
  --fracgui-folder-header-font-size: var(--font-xxs);
  --fracgui-folder-header-font-weight: 500;
  --fracgui-folder-content-background: rgba(var(--bg-b-rgb), 0.2);
  --fracgui-folder-content-padding-left: 0.33rem;
  --fracgui-folder-content-font-size: 0.8rem;
  --fracgui-folder-content-font-weight: 300;
  --fracgui-input-container-color: var(--fg-c);
  --fracgui-input-container-background: rgba(var(--bg-a-rgb), 0.5);
  --fracgui-input-container-outline: 1px solid rgba(var(--bg-a-rgb), 0.2);
  --fracgui-input-container-shadow:
  	-0.15px 0.1px 1px hsla(220, 10%, 2%, calc(0.2 * var(--shadow-lightness))) inset,
  	-2px 2px 15px hsla(220, 10%, 2%, calc(0.075 * var(--shadow-lightness))) inset,
  	-3.0px 3px 25px hsla(220, 10%, 2%, calc(0.05 * var(--shadow-lightness))) inset,
  	-10.0px 10px 50px hsla(220, 10%, 2%, calc(0.025 * var(--shadow-lightness))) inset ;
  --fracgui-drawer-toggle-background: rgba(var(--bg-a-rgb), 0.5);
  --fracgui-controller-background: rgba(var(--bg-c-rgb), 1);
  --fracgui-controller-background-dim: rgba(var(--bg-c-rgb), 0.75);
  --fracgui-controller-color: var(--fg-d);
  --fracgui-input-shadow: var(--shadow-xs);
  --fracgui-input-outline: 1px solid color-mix(in lch, var(--bg-d), transparent 75%);
  --fracgui-controller-background-image: none;
  --fracgui-input-buttons-background: rgba(var(--bg-b-rgb), var(--fracgui-alpha));
  --fracgui-input-buttons-color: var(--fg-b);
  --fracgui-input-buttons-icon-color: var(--fg-d);
  --fracgui-input-buttons-icon-color-active: var(--theme-a);
  --fracgui-input-number-buttons-shadow-inset-hover: 0px 0px 1px 0px hsl(0, 0%, 0%) inset;
  --fracgui-input-number-buttons-shadow-inset-active: 0px 0px 1px 1px hsl(0, 0%, 5%) inset;
  --fracgui-input-font-size: var(--font-xs);
  --fracgui-input-number-range-color: var(--bg-c);
  --fracgui-input-number-range-color-active: var(--theme-a);
  --fracgui-input-number-range-background: var(--bg-a);
  --fracgui-input-number-range-outline: 1px solid rgba(var(--bg-c-rgb), 0.25);
  --fracgui-input-number-range-shadow:
  	-2px 2px 2.5px hsla(230, 20%, 0%, 0.2),
  	2px 2px 5px hsla(230, 20%, 0%, 0.2),
  	2px 3px 10px hsla(230, 20%, 0%, 0.2),
  	2px 4px 4px hsla(230, 25%, 0%, 0.2) ;
}

.fracgui-root[mode=light] {
  --shadow-lightness: 0.2;
  --fracgui-input-number-buttons-shadow-inset-hover: 0px 0px 1px 0px hsl(0, 0%, 80%) inset;
  --fracgui-input-number-buttons-shadow-inset-active: 0px 0px 2px 1px hsl(0, 0%, 90%) inset;
  --fracgui-controller-background-dim: rgba(var(--bg-a-rgb), 0.5);
  --fracgui-controller-background: rgba(var(--bg-a-rgb), 1);
  --fracgui-controller-color: var(--fg-c);
  --fracgui-input-outline: 1px solid rgba(var(--bg-d-rgb), 0.1);
  --fracgui-input-number-range-background: var(--bg-b);
  --fracgui-input-number-range-color: var(--bg-d);
  --fracgui-input-number-range-shadow:
  -2px 2px 2px hsla(230, 20%, 30%, 0.1),
  2px 2px 3px hsla(230, 20%, 20%, 0.1),
  2px 2px 7px hsla(230, 20%, 30%, 0.1) ;
}

.fracgui-root[theme=soft] {
  --gradient-neumorphic-a: linear-gradient(
  	145deg,
  	hsla(230, 20%, 12.5%, 0.5),
  	hsla(230, 20%, 5%, 0.66)
  );
  --shadow-neumorphic-a:
  	-4px -2px 5px hsla(230, 20%, 23%, 0.3),
  2px 2px 10px hsla(230, 20%, 5%, 0.66),
  2px 2px 15px hsla(230, 20%, 5%, 0.66),
  -2px -2px 15px hsla(230, 25%, 21%, 0.3) ;
  --shadow-neumorphic-b: 0 0 5px 0.5px hsla(0, 0%, 0%, 0.5),
  1px 1px 5px 0.5px hsla(0, 0%, 0%, 0.33),
  0 0 5px 0.5px hsla(0, 0%, 0%, 0.5) inset,
  -2px -2px 3px 0.5px hsla(230, 20%, 25%, 0.5),
  -2px -2px 10px 0px hsla(230, 20%, 15%, 0.75),
  2px 2px 3px 0px hsla(231, 17%, 23%, 0.5) inset ;
}

.fracgui-root {
  z-index: 0;
}

.fracgui-header {
  z-index: 2;
}

.fracgui-toolbar {
  z-index: 3;
}

.fracgui-root .fracgui-content-wrapper,
.fracgui-folder .fracgui-content-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  animation-name: open;
  animation-duration: 0.5s;
  animation-direction: forwards;
  animation-timing-function: cubic-bezier(0.1, 1, 0.1, 1);
}
.fracgui-root .fracgui-header,
.fracgui-folder .fracgui-header {
  height: var(--header-height);
  max-height: var(--header-height);
}
.fracgui-root.closed .fracgui-content-wrapper,
.fracgui-folder.closed .fracgui-content-wrapper {
  animation-name: close;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.05, 1, 0.2, 1);
}
.fracgui-root.closed .fracgui-folder .fracgui-header,
.fracgui-folder.closed .fracgui-folder .fracgui-header {
  max-height: 0;
}

.fracgui-root.closed .fracgui-content {
  transition: opacity 0.1s;
  transition-delay: 0.1s;
  opacity: 0 !important;
}

.fracgui-root.animating .fracgui-content, .fracgui-root.closed .fracgui-content,
.fracgui-folder.animating .fracgui-content,
.fracgui-folder.closed .fracgui-content {
  overflow: hidden;
}
.fracgui-root.animating .fracgui-content::-webkit-scrollbar-thumb, .fracgui-root.closed .fracgui-content::-webkit-scrollbar-thumb,
.fracgui-folder.animating .fracgui-content::-webkit-scrollbar-thumb,
.fracgui-folder.closed .fracgui-content::-webkit-scrollbar-thumb {
  background: transparent !important;
}
@-moz-document url-prefix() {
  .fracgui-root.animating .fracgui-content, .fracgui-root.closed .fracgui-content,
  .fracgui-folder.animating .fracgui-content,
  .fracgui-folder.closed .fracgui-content {
    scrollbar-color: transparent transparent;
  }
}

@keyframes reveal {
  from {
    grid-template-rows: 0fr;
  }
  to {
    grid-template-rows: 1fr;
  }
}
@keyframes open {
  from {
    grid-template-rows: 0fr;
  }
  to {
    grid-template-rows: 1fr;
  }
}
@keyframes close {
  from {
    grid-template-rows: 1fr;
  }
  to {
    grid-template-rows: 0fr;
  }
}
.fracgui-root {
  position: absolute;
  display: flex;
  flex-direction: column;
  inset: 0;
  width: var(--fracgui-width);
  min-width: var(--fracgui-min-width, 20rem);
  max-width: var(--fracgui-max-width);
  height: fit-content;
  max-height: var(--max-height, 90dvh);
  user-select: none;
  z-index: 99;
}

.fracgui-root > .fracgui-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  width: 100%;
  min-height: var(--fracgui-root-header-height);
  color: var(--fg-c);
  background: var(--bg-a);
  border-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-xs);
  border-bottom-right-radius: var(--radius-xs);
  box-shadow: var(--fracgui-root-shadow);
  cursor: pointer;
  cursor: grab;
}
.fracgui-root > .fracgui-header .fracgui-title {
  width: fit-content;
  height: var(--header-height);
  font-size: var(--fracgui-root-header-font-size);
  letter-spacing: 2px;
  line-height: calc(var(--header-height) - 4px);
  font-family: var(--fracgui-font);
  font-weight: 400;
  font-variation-settings: "wght" 300;
  pointer-events: none;
}

.fracgui-root > .fracgui-content-wrapper > .fracgui-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  border-radius: var(--radius-md);
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
  background: var(--fracgui-root-content-background);
  backdrop-filter: blur(var(--fracgui-blur));
  outline-offset: -1px;
  box-shadow: 0 0 1.5px 0.5px rgba(var(--bg-d-rgb), 0.5) inset;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}
@-moz-document url-prefix() {
  .fracgui-root > .fracgui-content-wrapper > .fracgui-content {
    scrollbar-color: var(--bg-b) var(--bg-a);
    scrollbar-width: thin;
    scrollbar-gutter: auto;
  }
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-webkit-scrollbar {
  width: 5px;
  height: 0px;
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-moz-scrollbar {
  width: 5px;
  height: 0px;
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-webkit-scrollbar-thumb {
  background: var(--fracgui-controller-background);
  border: none;
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-moz-scrollbar-thumb {
  background: var(--fracgui-controller-background);
  border: none;
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-webkit-scrollbar-track {
  background: var(--fracgui-folder-header-background);
  border-bottom-right-radius: var(--radius-sm);
}
.fracgui-root > .fracgui-content-wrapper > .fracgui-content::-moz-scrollbar-track {
  background: var(--fracgui-folder-header-background);
  border-bottom-right-radius: var(--radius-sm);
}

@-moz-document url-prefix() {
  .fracgui-root.animating > .fracgui-content-wrapper > .fracgui-content {
    overflow: hidden;
  }
}

.fracgui-root > .fracgui-content-wrapper > .fracgui-folder {
  padding-right: 0.25rem;
  background: #15161d;
}

.fracgui-folder {
  height: fit-content;
  background: var(--fracgui-folder-background);
}

.fracgui-folder .fracgui-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: var(--fracgui-folder-header-width, 100%);
  padding-left: var(--fracgui-folder-header-padding-left);
  color: var(--fracgui-folder-header-color, var(--fg-c));
  background: var(--fracgui-folder-header-background, var(--bg-a));
  outline: var(--fracgui-folder-header-outline, 1px solid rgba(var(--bg-b-rgb), 0.5));
  outline-offset: -1px;
  box-shadow: var(--fracgui-folder-header-box-shadow, 0 0 0.1rem #000 inset);
  cursor: pointer;
}
.fracgui-folder .fracgui-header .fracgui-title {
  font-weight: var(--fracgui-folder-header-font-weight);
  font-size: var(--fracgui-folder-header-font-size);
  font-family: var(--fracgui-font);
  width: fit-content;
}
.fracgui-folder .fracgui-header .icon-folder-container {
  width: 1.1rem !important;
  height: 1.1rem !important;
  color: var(--fg-c);
  opacity: 0.75;
  transition: opacity 0.15s;
}
.fracgui-folder .fracgui-header:hover svg.icon-folder {
  opacity: 1;
}

.fracgui-folder .fracgui-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-left: var(--fracgui-folder-content-padding-left) solid var(--fracgui-folder-header-background);
  background: var(--fracgui-folder-content-background, var(--fracgui-folder-background));
}

.fracgui-controller-select-container {
  position: relative;
}

.fracgui-controller-select-selected {
  border-radius: var(--radius-xs);
  outline: 1px solid rgba(var(--bg-d-rgb), 0);
  text-align: center;
  font-family: var(--fracgui-font);
  font-size: var(--fracgui-folder-content-font-size);
  transition: 0.15s;
  cursor: pointer;
}
.fracgui-controller-select-selected.active, .fracgui-controller-select-selected:hover, .fracgui-controller-select-selected:focus-visible, .fracgui-controller-select-selected:active {
  filter: contrast(1.1) brightness(1.25);
  outline-offset: 0.25rem;
  outline: 1px solid rgba(var(--bg-d-rgb), 0.5);
}
.fracgui-controller-select-selected.active {
  outline: var(--fracgui-input-outline);
}

.fracgui-controller-select-dropdown {
  display: none;
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: fit-content;
  padding: 0.1rem;
  background: var(--bg-a);
  border-radius: var(--radius);
  box-shadow: 0px 0.3px 0.3px hsl(var(--shadow-lightness)/0.49), -0.1px 2.1px 2.2px -0.6px hsl(var(--shadow-lightness)/0.47), -0.2px 4.6px 4.9px -1.2px hsl(var(--shadow-lightness)/0.45), -0.4px 9.2px 9.8px -1.7px hsl(var(--shadow-lightness)/0.42), -0.7px 17.4px 18.5px -2.3px hsl(var(--shadow-lightness)/0.4), -1.2px 30.6px 32.6px -2.9px hsl(var(--shadow-lightness)/0.38);
  font-family: var(--fracgui-font);
  font-size: var(--font-xxs);
  z-index: 100;
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1), inset 0s;
  opacity: 0;
  pointer-events: none;
  transform: translate(0, 0) scaleY(0);
  transform-origin: top center;
}
.fracgui-controller-select-dropdown.expanded {
  display: block;
  position: absolute;
  opacity: 1;
  transform: translate(0, 0.5rem) scaleY(1);
}

.fracgui-controller-select-option {
  padding: 0.1rem 0.75rem;
  line-height: 1.5rem;
  transition: 0.15s;
  outline: 1px solid rgba(var(--bg-d-rgb), 0);
  cursor: pointer;
}
.fracgui-controller-select-option:hover, .fracgui-controller-select-option:focus-visible {
  background: var(--bg-c);
  filter: contrast(1.1) brightness(1.25);
  outline: 1px solid rgba(var(--bg-d-rgb), 1);
  color: var(--fg-a);
}
.fracgui-controller-select-option:first-of-type {
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
}
.fracgui-controller-select-option:last-of-type {
  border-bottom-left-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
}

.fracgui-toolbar {
  contain: paint;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 75%;
}

.fracgui-search-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 0.25rem 0.1rem 0.25rem 0;
  cursor: pointer;
  transition: 0.15s;
  backface-visibility: hidden;
}

.fracgui-search-button {
  all: unset;
  display: flex;
  align-items: center;
  width: 1.5rem;
  height: 0.9rem;
  transition: 0.15s;
}
.fracgui-search-button svg {
  pointer-events: none;
  transition-duration: 0.15s !important;
}
.fracgui-search-button svg path {
  transform: translate(0, 0) scale(1);
  transform-origin: 50% 50%;
  transition-duration: 0.15s !important;
}
.fracgui-search-button svg circle {
  fill: transparent;
  transform: translate(0, 0) scale(1);
  transition-duration: 0.15s !important;
}

.fracgui-search-button {
  color: var(--bg-d);
  opacity: 0;
}

.fracgui-header:hover .fracgui-search-button {
  transition-duration: 0.5s;
  opacity: 0.5;
}

.fracgui-search-button:hover {
  transition-duration: 0.25s;
  color: var(--fg-e);
  opacity: 1;
}

.fracgui-search-button:active {
  transition-duration: 0.05s;
  background: transparent;
  color: var(--fg-d);
  opacity: 1;
  scale: 0.9;
}

.fracgui-search-container.active .fracgui-search-button {
  color: var(--bg-e);
  opacity: 1;
}
.fracgui-search-container.active .fracgui-search-button path {
  transform: translate(-10%, 10%) scale(0);
  transform-origin: 60% 60%;
}
.fracgui-search-container.active .fracgui-search-button circle {
  fill: var(--bg-e);
  transform: translate(-10%, 20%) scale(0.75);
}

input.fracgui-search-input {
  width: 6rem;
  height: 1rem;
  padding: 0 0.25rem;
  color: var(--fg-c);
  background: var(--bg-b);
  border-radius: var(--radius-sm);
  box-shadow: 0 0 11px rgba(0, 0, 0, 0.2666666667) inset;
  outline: none;
  border: none;
  font-size: var(--font-xxs);
  font-family: var(--font-b);
  caret-color: var(--bg-e);
  caret-shape: block;
  line-height: 4px !important;
  transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
.fracgui-root[mode=light] input.fracgui-search-input {
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.0666666667) inset;
}

.fracgui-search-input {
  max-width: 0rem;
  opacity: 0;
  pointer-events: none;
  transition-duration: 1s;
}

.fracgui-search-container.active .fracgui-search-input {
  max-width: 6rem;
  opacity: 1;
  pointer-events: all;
  transition-duration: 0.33s;
}

.fracgui-folder .copy-button {
  cursor: pointer;
  width: var(--copy-button-width, 2rem);
  height: var(--copy-button-height, 2rem);
  padding: 10%;
  color: var(--fg-a);
  background: rgba(var(--bg-a-rgb), 0);
  outline: 1px solid transparent;
  border-radius: 0.2rem;
  backdrop-filter: blur(0px);
  transition-property: all, background, color;
  transition-delay: 0s, 1s, 0.75s;
  transition-duration: 0.25s, 0.5s;
  font-size: 0.8rem;
  font-family: var(--font-mono);
}
.fracgui-folder .copy-button:not(.active, .outro):hover {
  color: var(--fg-b);
  backdrop-filter: blur(2px);
  background: rgba(var(--bg-a-rgb), 0.75);
  transition-duration: 0.15s, 0.25s;
  transition-delay: 0s;
}
.fracgui-folder .copy-button:not(.active, .outro):active, .fracgui-folder .copy-button:not(.active, .outro):focus {
  color: var(--fg-c);
  background: var(--bg-c);
}
.fracgui-folder .copy-button.active, .fracgui-folder .copy-button.outro {
  color: var(--fg-a);
  outline-color: transparent !important;
  background: rgba(var(--bg-a-rgb), 0);
  opacity: 1 !important;
  transition-delay: 0s;
  transition-duration: 0.25s;
}
.fracgui-folder .copy-button-svg-container {
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  grid-area: 1/1;
}
.fracgui-folder svg {
  overflow: visible;
  width: 100%;
  height: 100%;
}
.fracgui-folder svg .front,
.fracgui-folder svg .back,
.fracgui-folder svg .check {
  transform-origin: 50% 50%;
}
.fracgui-folder svg .front {
  transition-duration: 0.66s !important;
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  stroke: currentColor;
}
.fracgui-folder svg.active .front {
  transition-timing-function: cubic-bezier(0.2, 2, 0.2, 0.85);
  transition-duration: 0.2s;
  transform: scale(2);
  fill: #12a084 !important;
  stroke: #12a084 !important;
}
.fracgui-folder svg.outro .front {
  transition-duration: 0.5s !important;
}
.fracgui-folder svg .back {
  transform: translate(0, 0);
  transition-duration: 0.33s;
  transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
}
.fracgui-folder svg.active .back {
  transform: translate(15%, 15%);
}
.fracgui-folder svg.outro .back {
  transition-delay: 0s !important;
  transition-duration: 1s !important;
}
.fracgui-folder svg .check {
  stroke: var(--color, var(--light-a));
  opacity: 0;
  transform: scale(0);
  transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s;
}
.fracgui-folder svg.active .check {
  opacity: 1;
  transform: scale(1.25);
  transition: 0.3s cubic-bezier(0.2, 2, 0.2, 0.85) 0.1s;
}

.fracgui-folder .fracgui-input-drawer-toggle {
  right: 0.5rem;
  top: 0.5rem;
  width: 0.5rem;
  height: 75%;
  color: var(--fg-c);
  background: var(--fracgui-drawer-toggle-background);
  transition: 0.15s;
  box-shadow: -1px 0 1px 0.5px rgba(var(--bg-a-rgb), 0.5) inset;
  border-top-right-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
  cursor: pointer;
}
.fracgui-folder .fracgui-input-drawer-toggle:hover {
  background: var(--bg-c);
}
.fracgui-folder .fracgui-input-title {
  max-width: var(--fracgui-input-section-1-width);
  min-width: var(--fracgui-input-section-1-width);
  text-wrap: balance;
  padding-left: 0.5rem;
  font-size: var(--fracgui-folder-content-font-size);
  font-weight: var(--fracgui-folder-content-font-weight);
  font-family: var(--fracgui-font);
  transition: 0.33s;
}
.fracgui-folder .fracgui-input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 0%;
  min-height: var(--fracgui-input-height);
  color: var(--fracgui-input-container-color);
  background: var(--fracgui-input-container-background);
  outline: var(--fracgui-input-container-outline);
  box-shadow: var(--fracgui-input-container-shadow);
  transition: all 0.15s, opacity 0.15s ease-in 0.2s;
}
.fracgui-folder .fracgui-input-container:first-of-type {
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
}
.fracgui-folder .fracgui-input-container:first-of-type::before {
  content: "";
  position: absolute;
  background-color: transparent;
  bottom: 1rem;
  width: 0.5rem;
  height: 1rem;
  border-top-left-radius: 0.2rem;
  box-shadow: 0 -0.5rem 0 0 var(--bg-a);
  opacity: 1;
  transition: inherit;
}
.fracgui-folder .fracgui-input-container:first-of-type::after {
  content: "";
  position: absolute;
  background-color: transparent;
  right: 0;
  bottom: 1rem;
  width: 0.5rem;
  min-height: 1rem;
  border-top-right-radius: 0.2rem;
  box-shadow: 0 -0.5rem 0 0 var(--bg-a);
  opacity: 1;
  transition: inherit;
}
.fracgui-folder:not(:last-of-type) .fracgui-input-container:last-of-type {
  border-bottom-left-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
}
.fracgui-folder:not(:last-of-type) .fracgui-input-container:last-of-type::before {
  content: "";
  position: absolute;
  background-color: transparent;
  top: 1rem;
  height: 1rem;
  width: 0.5rem;
  border-bottom-left-radius: 0.1rem;
  box-shadow: 0 0.5rem 0 0 var(--bg-a);
}
.fracgui-folder:not(:last-of-type) .fracgui-input-container:last-of-type::after {
  content: "";
  position: absolute;
  background-color: transparent;
  right: 0;
  top: 1rem;
  height: 1rem;
  width: 0.5rem;
  border-bottom-right-radius: 0.1rem;
  box-shadow: 0 0.5rem 0 0 var(--bg-a);
}

.fracgui-folder .fracgui-input-container:hover {
  color: var(--fg-b);
}
.fracgui-folder .fracgui-input-container:has(input:active) .fracgui-input-number-input, .fracgui-folder .fracgui-input-container:has(.fracgui-controller:active) .fracgui-input-number-input {
  opacity: 1;
  background: var(--fracgui-controller-background);
}
.fracgui-folder .fracgui-input-container:has(input:active) .fracgui-input-title, .fracgui-folder .fracgui-input-container:has(.fracgui-controller:active) .fracgui-input-title {
  color: var(--theme-a);
}
.fracgui-folder .fracgui-input-container.fracgui-search-hit {
  min-height: var(--fracgui-input-height);
}
.fracgui-folder .fracgui-input-container.fracgui-search-hit .fracgui-input-title {
  color: var(--theme-a);
}
.fracgui-folder .fracgui-input-container.fracgui-search-miss {
  min-height: 0rem;
  overflow: hidden;
}
.fracgui-folder .fracgui-input-container.fracgui-search-miss::after {
  opacity: 0;
  transition: inherit;
}
.fracgui-folder .fracgui-input-container.fracgui-search-miss::before {
  opacity: 0;
  transition: inherit;
}
.fracgui-folder .fracgui-input-container.expanded .fracgui-input-container {
  min-height: unset;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  margin: 0;
  padding-right: 0.75rem;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  height: 90%;
  border-radius: var(--radius-sm);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 2rem;
  height: 1.5rem;
  margin: 0;
  padding: 0;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  height: 45%;
  color: var(--fracgui-input-buttons-color);
  background: var(--fracgui-controller-background-dim);
  opacity: 0.5;
  border: none;
  border-radius: var(--radius-xs);
  box-shadow: var(--fracgui-input-number-buttons-shadow-inset);
  transition: 0.15s;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button svg {
  width: 1rem;
  height: 1rem;
  color: var(--fracgui-input-buttons-icon-color);
  opacity: 0.1;
  scale: 1;
  transition: 0.15s;
  user-select: none;
  pointer-events: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button:hover {
  box-shadow: var(--fracgui-input-number-buttons-shadow-inset-hover);
  background: var(--fracgui-controller-background);
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button:hover svg {
  opacity: 1 !important;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button:active {
  background: var(--fracgui-controller-background);
  box-shadow: var(--fracgui-input-number-buttons-shadow-inset-active);
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-button:active svg {
  opacity: 1 !important;
  color: var(--fracgui-input-buttons-icon-color-active);
  filter: drop-shadow(0 0 3px var(--theme-a));
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-buttons-increment {
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-container .fracgui-input-number-buttons-container .fracgui-input-number-buttons-decrement {
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content:hover .fracgui-input-number-input {
  color: var(--fg-b);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content:hover input.fracgui-input-number-range::-webkit-slider-thumb {
  background-color: var(--bg-d);
  transition: 0.15s;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content:hover input.fracgui-input-number-range::-webkit-slider-thumb:active {
  background-color: var(--theme-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 0.5rem;
  accent-color: var(--fracgui-input-number-range-color);
  background: var(--fracgui-input-number-range-background);
  border-radius: var(--radius-xs);
  box-shadow: var(--fracgui-input-number-range-shadow);
  outline: var(--fracgui-input-number-range-outline);
  opacity: 0.7;
  transition: 0.15s;
  overflow: visible;
  min-width: 1rem;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range:hover {
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range:active {
  background: color-mix(in lch, var(--theme-a), var(--fracgui-input-number-range-background));
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.5rem;
  height: 1rem;
  background: var(--fracgui-input-number-range-color);
  border-radius: var(--radius-xs);
  border: none;
  transition: 0.15s;
  cursor: pointer;
  z-index: 10;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range::-moz-range-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.5rem;
  height: 1rem;
  background: var(--fracgui-input-number-range-color);
  border-radius: var(--radius-xs);
  border: none;
  transition: 0.15s;
  cursor: pointer;
  z-index: 10;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range:active::-webkit-slider-thumb {
  background: var(--theme-a);
  box-shadow: 0 0 20px var(--theme-a);
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range:active::-moz-range-thumb {
  background: var(--theme-a);
  box-shadow: 0 0 20px var(--theme-a);
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range::-moz-range-track {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  z-index: 9;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content input.fracgui-input-number-range::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  z-index: 9;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-input,
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-text-input {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  width: 100%;
  min-width: 2rem;
  max-width: var(--fracgui-input-section-2-width);
  height: 1.25rem;
  color: var(--fracgui-controller-color);
  background: var(--fracgui-controller-background-dim);
  background-image: var(--fracgui-controller-background-image);
  box-shadow: var(--fracgui-input-shadow);
  border-radius: var(--radius-sm);
  border: none;
  outline: var(--fracgui-input-outline);
  font-family: var(--font-mono);
  font-size: var(--fracgui-input-font-size);
  text-align: center;
  font-variation-settings: "wght" 500;
  transition: 0.15s;
  overflow: visible;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-input:hover,
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-text-input:hover {
  background: var(--fracgui-controller-background);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-input::-webkit-inner-spin-button, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-input::-webkit-outer-spin-button,
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-text-input::-webkit-inner-spin-button,
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-text-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-number-input.dragging,
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-text-input.dragging {
  outline: 1px solid color-mix(in lch, var(--theme-a), rgba(255, 255, 255, 0) 50%);
  box-shadow: 0 0 0.75rem color-mix(in lch, var(--theme-a), rgba(255, 255, 255, 0) 66%);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  margin: 0.25rem 0;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container {
  position: relative;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container .copy-button {
  position: absolute;
  top: -8px;
  right: -8px;
  height: 1.5rem;
  padding: 3px;
  background: none !important;
  color: var(--fg-d);
  filter: brightness(0.75) contrast(0.8);
  backdrop-filter: none;
  opacity: 0;
  z-index: 10;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container .copy-button svg .back {
  fill: var(--fg-d);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container .copy-button:hover {
  filter: brightness(1) contrast(1);
  backdrop-filter: none;
  color: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container .copy-button:hover svg .back {
  fill: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-container:hover .copy-button {
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-background {
  width: var(--fracgui-input-section-2-width);
  min-width: var(--fracgui-input-section-2-width);
  height: 1.5rem;
  background-image: linear-gradient(45deg, var(--bg-a) 25%, transparent 25%), linear-gradient(-45deg, var(--bg-a) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--bg-a) 75%), linear-gradient(-45deg, transparent 75%, var(--bg-a) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  clip-path: xywh(0 12% 100% 72% round var(--radius-sm));
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-current-color-display {
  height: 100%;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  width: var(--fracgui-input-section-3-width);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-canvas {
  display: flex;
  width: 100%;
  height: 3rem;
  border-radius: var(--radius);
  cursor: pointer;
  overflow: hidden;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 0.5rem;
  height: 0.5rem;
  translate: -50% -50%;
  border-radius: 50%;
  border: 1px solid var(--fg-a);
  box-shadow: 0 0 0.25rem 0rem var(--bg-d);
  opacity: 0;
  transition-property: all, opacity;
  transition-delay: 0s, 0s;
  transition-duration: 0.2s, 0.33s;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  pointer-events: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container.expanded .fracgui-input-color-picker-handle {
  opacity: 1;
  transition-delay: 0s, 0.25s;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue {
  appearance: none;
  width: 99%;
  border-radius: var(--radius-sm);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue::-webkit-slider-thumb {
  appearance: none;
  width: 0.5rem;
  height: 0.5rem;
  border: none;
  transition: 0.15s;
  cursor: pointer;
  z-index: 10;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue::-moz-range-thumb {
  appearance: none;
  width: 0.5rem;
  height: 0.5rem;
  border: none;
  transition: 0.15s;
  cursor: pointer;
  z-index: 10;
}
@-moz-document url-prefix() {
  .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue {
    scrollbar-height: 0.5rem;
  }
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue::-webkit-slider-runnable-track {
  appearance: none;
  background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(0, 100%, 50%));
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  z-index: 1;
  background-color: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-hue::-moz-range-track {
  appearance: none;
  background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(0, 100%, 50%));
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  z-index: 1;
  background-color: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-alpha {
  appearance: none;
  width: 99%;
  border-radius: var(--radius-sm);
  background-color: transparent;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-alpha::-webkit-slider-thumb {
  appearance: none;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--bg-b);
  border: none;
  transition: 0.15s;
  cursor: pointer;
  z-index: 10;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-picker-container .fracgui-input-color-picker-alpha::-webkit-slider-runnable-track {
  appearance: none;
  background: linear-gradient(to right, transparent, currentColor);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  z-index: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-text {
  position: absolute;
  left: 2.25rem;
  max-width: 5rem;
  opacity: 0;
  transform: translateX(-0.5rem);
  pointer-events: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-text.visible {
  opacity: 1;
  transform: translateX(0);
  pointer-events: all;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-select-container {
  width: 2rem;
  color: var(--fg-d);
  font-size: var(--font-xs);
  font-family: var(--font-mono);
}
.fracgui-root[mode=light] .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-select-container {
  color: var(--bg-e);
}

.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-select-container span {
  transition: 0.4s;
  text-shadow: 0 0 0 transparent;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-select-container .fracgui-controller-select-dropdown {
  transform: translate(-20%, 0rem);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-select-container .fracgui-controller-select-dropdown.expanded {
  transform: translate(-20%, 0.5rem);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.a.hovering) .fracgui-input-color-components-select-container span.a {
  color: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.a.dragging) .fracgui-input-color-components-select-container span.a {
  color: var(--theme-a);
  text-shadow: 0 0 0.5rem var(--theme-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.b.hovering) .fracgui-input-color-components-select-container span.b {
  color: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.b.dragging) .fracgui-input-color-components-select-container span.b {
  color: var(--theme-a);
  text-shadow: 0 0 0.5rem var(--theme-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.c.hovering) .fracgui-input-color-components-select-container span.c {
  color: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.c.dragging) .fracgui-input-color-components-select-container span.c {
  color: var(--theme-a);
  text-shadow: 0 0 0.5rem var(--theme-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.d.hovering) .fracgui-input-color-components-select-container span.d {
  color: var(--fg-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container:has(input.d.dragging) .fracgui-input-color-components-select-container span.d {
  color: var(--theme-a);
  text-shadow: 0 0 0.5rem var(--theme-a);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-numbers-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  width: 90%;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-numbers-container .fracgui-input-number-input {
  height: 1.25rem;
  max-width: unset;
  color: var(--fracgui-controller-color);
  background: var(--fracgui-controller-background-dim);
  border-radius: var(--radius-sm);
  box-shadow: var(--fracgui-input-shadow);
  outline: var(--fracgui-input-outline);
  transition: 0.15s;
  overflow: visible;
  opacity: 0;
  transform: translateX(-0.5rem);
  pointer-events: none;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-numbers-container .fracgui-input-number-input.visible {
  opacity: 1;
  background: var(--fracgui-controller-background);
  transform: translateX(0);
  pointer-events: all;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-color-container .fracgui-input-color-body .fracgui-input-color-components-container .fracgui-input-color-components-numbers-container .fracgui-input-number-input:hover {
  color: var(--fg-b);
  opacity: 1;
  background: var(--fracgui-controller-background);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content:hover .fracgui-input-number-input {
  background: var(--fracgui-controller-background);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content:hover .fracgui-input-number-buttons-container .fracgui-input-number-button {
  opacity: 1;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container {
  width: 100%;
  height: 100%;
  font-size: var(--font-xs);
  font-family: var(--fracgui-font);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected {
  line-height: 1.25rem;
  height: 1.25rem;
  background: var(--fracgui-controller-background-dim);
  border-radius: var(--radius-xs);
  outline: var(--fracgui-input-outline);
  filter: unset;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected::before {
  content: "❯";
  position: absolute;
  top: 0;
  right: 0.5rem;
  margin: auto;
  color: var(--bg-d);
  transform: rotate(90deg) translateX(0);
  transition: 0.2s;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected.active, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:hover, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:focus-visible, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:active {
  background: var(--fracgui-controller-background);
  outline-offset: 0rem;
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected.active::before, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:hover::before, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:focus-visible::before, .fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected:active::before {
  color: var(--bg-e);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected.active {
  outline: var(--fracgui-input-outline);
}
.fracgui-folder .fracgui-input-container .fracgui-input-content .fracgui-input-select-container .fracgui-controller-select-selected.active::before {
  color: var(--fg-d);
  transform: rotate(90deg) translateX(2px);
}
body .fracgui-controller-select-dropdown {
  transform: translate(0, -0.25rem);
  backdrop-filter: blur(5px);
  outline: 1px solid;
  color: var(--light-b);
  background: color-mix(in lch, var(--dark-a) 60%, transparent);
  outline-color: var(--dark-b);
}
body .fracgui-controller-select-dropdown.expanded {
  transform: translate(0, 0.1rem);
}
body .fracgui-controller-select-dropdown .fracgui-controller-select-option:hover {
  color: var(--light-a);
  background: color-mix(in lch, var(--dark-a), transparent);
  outline-color: var(--dark-c);
}
body:has(.fracgui-root[mode=light]) .fracgui-controller-select-dropdown {
  color: var(--dark-b);
  background: color-mix(in lch, var(--light-a) 60%, transparent);
  outline-color: var(--light-b);
}
body:has(.fracgui-root[mode=light]) .fracgui-controller-select-dropdown .fracgui-controller-select-option:hover {
  color: var(--dark-a);
  background: color-mix(in lch, var(--light-d) 60%, transparent);
  outline-color: var(--light-d);
}
`

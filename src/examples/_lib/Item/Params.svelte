<script context="module" lang="ts">
	export interface Param {
		id?: string
		type: string
		title?: string
		description?: string
		children?: Param[]
	}
</script>

<script lang="ts">
	export let params: Param[] = []

	let connectorStart = 0
	let connectorEnd = 0
	let height = 0
	let nodeHeight = 0

	const hasChild = (p: Param) => p.children != undefined

	function setConnectorLength(node: Element, options: { position: 'first' | 'last' }) {
		nodeHeight = Math.max(node.clientHeight, nodeHeight)

		if (options.position === 'first') {
			connectorStart = node.getBoundingClientRect().top + nodeHeight
		} else {
			connectorEnd = node.getBoundingClientRect().top + nodeHeight / 2

			height = Math.min(connectorEnd - connectorStart, nodeHeight)
		}
	}
</script>

<div class="params">
	{#each params as p}
		<div class="param" class:col={hasChild(p)}>
			<div class="row">
				<div class="keys row">
					<div class="key type">
						<div class="code">{p.type}</div>
					</div>

					<div class="key title">
						{#if p.title}
							<div>{p.title}</div>
						{/if}
					</div>

					<div class="seperator" />
				</div>

				<div class="description">{@html p.description}</div>
			</div>

			{#if p.children}
				{#each p.children as child, i}
					{@const isFirst = i === 0}
					{@const isLast = i + 1 === p.children.length}

					<div class="param indented">
						{#if isFirst}
							<div
								use:setConnectorLength={{ position: 'first' }}
								class="connector"
								style="height: {height}px !important"
							/>
						{/if}

						<div class="row">
							<div class="keys row">
								<div class="key type">
									{#if isLast}
										<div
											class="code"
											use:setConnectorLength={{ position: 'last' }}
										>
											{child.type}
										</div>
									{:else}
										<div class="code">
											{child.type}
										</div>
									{/if}
								</div>

								<div class="key title">
									<div>{child.title}</div>
								</div>

								<div class="seperator" />
							</div>

							<div class="description">{@html child.description}</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.params {
		padding: 1.5rem 0;
		font-family: var(--font-b);
	}

	.keys {
		display: flex;
		flex-shrink: 0;

		width: var(--width, 140px);

		font-family: var(--font-mono);
	}

	.keys.row {
		flex-direction: row;
		align-items: center;
		height: fit-content;
	}

	.key {
		display: flex;
		justify-content: center;
		align-items: center;

		&,
		.key div {
			width: max-content;
			height: max-content;
		}
		padding-right: 5px;

		font-size: 0.8rem;
		font-style: normal;

		text-align: right;

		&.type {
			display: flex;
			justify-content: flex-end;

			& div {
				justify-content: center;

				width: 60px;

				text-align: center;
			}
		}

		&.title {
			display: flex;
			justify-content: flex-start;
			align-items: center;

			padding-left: 0.5rem;

			font-size: 0.95rem;
			font-variation-settings: 'wght' 600;
			transform: translateY(-1.5px);

			color: var(--theme-b);
			// text-shadow: 0px 0px 1px var(--theme-a);
		}
	}

	.seperator {
		flex: 1;

		height: 1px;

		background: var(--fg-d);
		opacity: 0.25;

		transform: translate(-4px, 2px) scaleX(0.5);
	}

	.description {
		white-space: pre-wrap;
		line-height: 1.4;
	}

	:global(.description em) {
		opacity: 0.5;
		font-family: var(--font-mono);
	}
	:global(.description span.code) {
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		background: var(--bg-a) !important;
		padding: 3px 7px 4px 7px;
		color: var(--fg-b) !important;
	}
	:global(html[theme='light']) {
		:global(span.code) {
			color: var(--bg-b) !important;
		}
		:global(span.code),
		:global(.type .code) {
			background: var(--fg-d) !important;
		}
	}

	.col {
		position: relative;
		flex-direction: column;
	}
	.col div {
		position: relative;
		z-index: 2;
	}

	.row {
		display: flex;
		flex-direction: row;
		// align-items: center;
	}

	.indented {
		margin-left: 1.5rem;
		margin-top: 5px;
	}

	.connector {
		position: absolute !important;
		top: -5px;
		left: -15px;
		z-index: 1;

		width: 10px;

		border: 2px solid var(--fg-d);
		border-radius: 2px;
		border-right: none;
		border-top: none;
	}
</style>

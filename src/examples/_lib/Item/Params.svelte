<script context="module" lang="ts">
	export interface Param {
		type: string
		title?: string
		description?: string
		children?: Param[]
	}
</script>

<script lang="ts">
	export let params: Param[] = []

	const hasChild = (p: Param) => p.children != undefined
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
					<div class="param indented">
						{#if i === 0}<div
								class="connector"
								style="height: {20 *
									(p.children.length > 1
										? p.children.length * 1.95
										: p.children.length)}px !important"
							/>{/if}
						<div class="row">
							<div class="keys row">
								<div class="key type">
									<div class="code">{child.type}</div>
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
		padding-top: 0.5rem;
	}

	.keys {
		display: flex;
		flex-shrink: 0;

		width: var(--width, 140px);
	}

	.key {
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

			padding-left: 0.5rem;

			font-size: 0.95rem;
			font-weight: thin;
			transform: translateY(-1.5px);

			color: var(--brand-b);
			// text-shadow: 0px 0px 1px var(--brand-a);
		}
	}

	.seperator {
		flex: 1;

		height: 1px;

		background: var(--fg-d);
		opacity: 0.25;

		transform: translate(-4px, 2px) scaleX(0.5);
	}

	:global(.description em) {
		opacity: 0.5;
		font-family: var(--mono);
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
		align-items: center;
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

		// height: 20px;
		width: 10px;

		border: 2px solid var(--fg-d);
		border-radius: 2px;
		border-right: none;
		border-top: none;
	}
</style>

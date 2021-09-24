<script>
	export let params = []

	const hasChild = (p) => p.child != undefined
</script>

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
				<!-- — -->
				<div class="seperator" />
			</div>
			<div class="description">{@html p.description}</div>
		</div>
		{#if p.child}
			<!-- <svelte:self params={[p.child]} /> -->
			<div class="param indented">
				<div class="connector" />
				<div class="row">
					<div class="key type">
						<div class="code">{p.child.type}</div>
					</div>
					<div class="key title">
						<div>{p.child.title}</div>
					</div>
					<!-- — -->
					<div class="seperator" />
				</div>
				<div class="description">{@html p.child.description}</div>
			</div>
		{/if}
	</div>
{/each}

<style lang="scss">
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
			font-weight: bolder;

			color: var(--text-a);
			text-shadow: 0px 0px 1px var(--color-primary);
		}
	}
	.seperator {
		flex: 1;

		height: 1px;

		background: var(--text-a);
		opacity: 0.25;

		transform: translate(-4px, 2px) scaleX(0.5);
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
		bottom: 10px;
		left: -15px;
		z-index: 1;

		height: 20px;
		width: 10px;

		border: 2px solid var(--text-a);
		border-radius: 2px;
		border-right: none;
		border-top: none;
	}
</style>

<script>
	import { onMount } from 'svelte'
    export let title = 'title'
    export let type = 'type'
    export let example = 'example'

    let Prism, highlightedExample
    onMount(async () => {
        const p = await import('prismjs')
        import('prismjs/components/')
        Prism = await p.default
        Prism.highlightAll()
        highlightedExample = Prism.highlight(example, Prism.languages.html, 'html')
    })
</script>

<div class='item'>
    <h1>{title}</h1>
    <slot name='description' />

    <pre><code class='language-html'>
        {#if highlightedExample}
        {@html highlightedExample}
        {/if}
    </code></pre>
    
    <h6>Result</h6>
    <slot name='result' />
</div>

<style>
    .item {
        display: flex;
        flex-direction: column;
        width: var(--col);
        background: var(--bg-a);
        margin: auto;
        padding: 1rem;
        border-radius: var(--border-radius);
    }

    .item h1 {
        font-size: 1.5rem;
    }
</style>

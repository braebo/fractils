<!-- 
    @component

    This is a [multiline](https://example.com)
    line comment.

    With a second {@link Paragraph}.

    And two examples, the first unnamed, and the second named with a filename/title.

    @example

    ```typescript
    console.log('hello world')
    ```

    @example Svelte Example

    ```svelte Example.svelte
    <script>
        console.log('hello world')
    </script>
    ```

    And using this comp:

    ```svelte +page.svelte
    <Test text="duder" />
    ```
 -->

<script lang="ts" context="module">
	export type Paragraph = string;
</script>

<script lang="ts">
	/**
	 * Super duper important text.
	 */
	export let text = 'world'
	/**
	 * Super duper important text.
	 */
	export let mynan = 'based'

	console.log(mynan)
</script>

<h1>Hello {text}</h1>

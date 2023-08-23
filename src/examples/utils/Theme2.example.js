export default `<script>
	import { toggleTheme, applyTheme } from 'fractils'
<\/script>

<button on:click={() => applyTheme("light")}> Light </button>
<button on:click={toggleTheme}> Toggle </button>
<button on:click={() => applyTheme("dark")}> Dark </button>`
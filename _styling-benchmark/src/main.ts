import { main, gigaSheet } from './styleBenchmark'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/ `
  <div>
    <h1></h1>
    
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`

const counter = document.querySelector<HTMLButtonElement>('#counter')!
const header = document.getElementsByTagName('h1')[0]

const results = await main(counter, {
	iterations: 1000000 / 5,
	cb: (name, time) => {
		console.log(name, time)
		header.innerText += `\n${name}: ${time}ms`
	},
})

console.log(results)

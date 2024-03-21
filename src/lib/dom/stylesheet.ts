export function stylesheet(css: string) {
    let once = false   

    return () => {
        if (once) return
        once = true
        const style = document.createElement('style')
        style.innerHTML = css
        document.head.appendChild(style)
    }
}
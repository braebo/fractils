/**
 * Creates an ANSI escape code formatted string for a clickable hyperlink in the terminal.
 *
 * @param url - The URL that the hyperlink will point to.
 * @param displayText - The text to be displayed in the terminal, which will be clickable.  If not provided, the URL will be used.
 * @returns The formatted string with ANSI escape codes for the hyperlink.
 *
 * @example
 * console.log(createHyperlink("https://example.com", "Visit Example"));
 * // This will print a clickable hyperlink with the text "Visit Example" that opens https://example.com
 */
export function cliHyperlink(url: string, displayText = url): string {
	return `\u001b]8;;${url}\u0007${displayText}\u001b]8;;\u0007`
}

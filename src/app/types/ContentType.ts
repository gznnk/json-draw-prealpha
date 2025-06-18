/**
 * Enumeration of content types
 */
export enum ContentType {
	/** Markdown editor */
	MARKDOWN = "markdown",
	/** Canvas (loaded from local storage or provided by the parent component) */
	CANVAS = "canvas",
	/** Sandbox */
	SANDBOX = "sandbox",
	/** Other type for future extension */
	OTHER = "other",
}

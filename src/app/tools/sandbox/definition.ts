// filepath: c:\Users\maver\Project\react-vite-project-2\src\app\tools\sandbox\definition.ts
// Import libraries.
import type { ToolDefinition } from "../../../shared/llm-client/types";

/**
 * Description for the sandbox tool that creates an interactive HTML sandbox.
 * Instructs LLMs on how to use this tool appropriately.
 */
const TOOL_DESCRIPTION = `
Use this tool to create interactive HTML applications like calculators, games, demos, or any content that requires HTML/CSS/JavaScript.
This tool is the preferred method for creating ANY interactive web content, rather than using workflow diagrams.

USE CASES (Always use this tool for):
- Interactive applications (calculators, converters, games)
- Demonstrations of HTML/CSS/JavaScript concepts
- Visual demos with user interaction
- Form-based applications
- Any app that requires client-side logic

MANDATORY IMPLEMENTATION REQUIREMENTS:
- NEVER reference external resources - DO NOT include URLs to external scripts, stylesheets, or images
- NEVER suggest users to "click links" or "download resources" - everything must work in the sandbox itself
- NEVER rely on CDNs or externally hosted libraries - all code must be inline
- NEVER use import statements that reference external modules
- ALWAYS implement complete working solutions directly within the sandbox HTML document

TECHNICAL SPECIFICATIONS:
- The HTML must be provided as a complete, valid document with proper DOCTYPE, html, head, and body tags
- All CSS must be included within <style> tags in the head section
- All JavaScript must be included within <script> tags in the document
- All images must be created inline using data URLs, SVG, or canvas drawing operations
- All game assets, sprites, and resources must be generated programmatically or stored as data URLs
- Games like Tetris must use canvas or DOM elements for rendering with standard event listeners for controls
- For graphics-intensive applications, use the HTML5 Canvas API within the sandbox
- Audio can be generated using the Web Audio API, but NOT with external audio files

SANDBOX LIMITATIONS:
- The sandbox has strict security limitations; it blocks:
  * fetch API and XMLHttpRequest for external resources
  * loading external scripts, stylesheets, or images
  * access to certain browser APIs that require permissions
- For complex applications, focus on creating fully self-contained implementations that work within these constraints

IMPLEMENTATION VERIFICATION:
- The HTML content you generate WILL BE USED AS IS - no further modifications will happen after generation
- Verify your code to ensure:
  * No external resource URLs are included anywhere in the document
  * All functionality works entirely within the sandbox
  * All assets are generated inline or included as data URLs
  * The implementation is complete and self-contained

EXAMPLE APPROACH:
When asked to "create a Tetris game", implement a complete, self-contained solution where:
1. The game board is rendered using canvas or DOM elements
2. Game pieces are drawn using CSS or canvas drawing operations
3. All game logic is implemented in vanilla JavaScript
4. Game state is managed within the document
5. NO external resources are referenced
`;

/**
 * Tool definition for creating sandbox environments with custom HTML content.
 */
/**
 * Tool definition for creating sandbox environments with custom HTML content.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "create_sandbox",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "sandbox_name",
			type: "string",
			description: "A descriptive name for the sandbox sheet.",
		},
		{
			name: "html_content",
			type: "string",
			description:
				"Complete, fully self-contained HTML document to display in the sandbox (including DOCTYPE, html, head, body tags). All resources, scripts, styles, and assets must be included inline. External resources will not work. The implementation must work entirely within the sandbox with no external dependencies.",
		},
	],
};

// Import libraries.
import type { ToolDefinition } from "../../../../shared/llm-client/types";

// Import shared descriptions.
import {
	X_PARAM_DESCRIPTION,
	Y_PARAM_DESCRIPTION,
} from "../shared/descriptions";

/**
 * Description text for the add_image_gen_node tool.
 * Explains the purpose and behavior of the image generation node.
 */
const TOOL_DESCRIPTION = `
Adds an ImageGeneration node to the canvas.  
The node receives input from connected LLM or text nodes.  
It uses the "gpt-image-1" model to generate an image based on the received input and outputs the generated image onto the canvas.  
The ImageGeneration node does not send any output to other nodes.
The size of the ImageGeneration node is 100 pixels wide and 100 pixels tall.
Returns a JSON object containing the node ID, node type and the size (width and height).
`;

/**
 * Tool definition for adding an image generation node to the canvas.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "add_image_gen_node",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "x",
			type: "number",
			description: X_PARAM_DESCRIPTION,
		},
		{
			name: "y",
			type: "number",
			description: Y_PARAM_DESCRIPTION,
		},
	],
};

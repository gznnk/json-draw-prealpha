// Import libraries.
import type { ToolDefinition } from "../../../../shared/llm-client/types";

// Import shared descriptions.
import {
	X_PARAM_DESCRIPTION,
	Y_PARAM_DESCRIPTION,
} from "../shared/descriptions";

/**
 * Description text for the add_text_node tool.
 * Explains the purpose and behavior of the Text node.
 */
const TOOL_DESCRIPTION = `
Adds a Text node to the canvas.  
The Text node can be used for entering and displaying text content.  
It can send text input to connected nodes and receive output from other nodes.  
The Text node is editable by the user and can be used for both input and output purposes.  
Returns a JSON object containing the node ID, node type and the size (width and height).
`;

/**
 * Tool definition for adding a Text node to the canvas.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "add_text_node",
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

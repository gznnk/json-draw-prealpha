// Import libraries.
import type { ToolDefinition } from "../../../llm-client/types";

/**
 * Description text for the connect_nodes tool.
 * Explains the purpose and behavior of node connections.
 */
const TOOL_DESCRIPTION = `
Creates a connection between two nodes on the canvas.  
The connection enables data flow from the source node to the target node.  
When connected, the output from the source node will be sent as input to the target node.  
Returns a JSON object containing the IDs of the connected nodes (sourceNodeId and targetNodeId).
`;

/**
 * Tool definition for connecting nodes on the canvas.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "connect_nodes",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "sourceNodeId",
			type: "string",
			description:
				"The ID of the source node from which the connection will start.",
		},
		{
			name: "targetNodeId",
			type: "string",
			description:
				"The ID of the target node to which the connection will end.",
		},
	],
};

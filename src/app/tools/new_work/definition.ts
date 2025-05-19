// Import libraries.
import type { ToolDefinition } from "../../../shared/llm-client/types";

/**
 * Description text for the new_work tool.
 * Explains the purpose and behavior of creating a new work.
 */
const TOOL_DESCRIPTION = `
Creates a new work in the current workspace.
When invoked, the tool adds a new work to the works list with the specified name.
Returns a confirmation with the created work's ID and name.
`;

/**
 * Tool definition for creating a new work in the workspace.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "new_work",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "work_name",
			type: "string",
			description: "The name for the new work to be created.",
		},
	],
};

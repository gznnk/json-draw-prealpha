// Import libraries.
import type { ToolDefinition } from "../../../shared/llm-client/types";

/**
 * Description text for the new_sheet tool.
 * Explains the purpose and behavior of creating a new sheet.
 */
const TOOL_DESCRIPTION = `
Creates a new sheet in the current workspace.  
When invoked, the tool generates a concise and meaningful name for the sheet based on user input.  
This helps keep sheets organized and easily identifiable.  
Returns a confirmation with the created sheet's name.
`;

/**
 * Tool definition for creating a new sheet in the workspace.
 * Conforms to the llm-client ToolDefinition interface.
 */
export const definition: ToolDefinition = {
	name: "new_sheet",
	description: TOOL_DESCRIPTION,
	parameters: [
		{
			name: "sheet_name",
			type: "string",
			description:
				"A brief input or prompt from the user, used to automatically generate an appropriate sheet name.",
		},
	],
};

/**
 * Handler function for the create_sandbox tool.
 * Creates a new sandbox sheet and injects the provided HTML content.
 */

import { newId } from "../../../features/svg-canvas/utils/shapes/common/newId";
import { dispatchAddNewSheetEvent } from "../../App";
import { dispatchUpdateSandboxContentEvent } from "../../components/SandboxSheet";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../features/llm-client/types";

/**
 * Handles the creation of a new sandbox with custom HTML content.
 * Creates a sandbox sheet and injects the provided HTML content with a small delay to ensure proper initialization.
 *
 * @param functionCall - The function call information containing sandbox_name and html_content
 * @returns Object containing the ID, name and status of the created sandbox or error information
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as {
		sandbox_name: string;
		html_content: string;
	};

	// Check if required arguments are present
	if (
		typeof args.sandbox_name === "string" &&
		typeof args.html_content === "string"
	) {
		// Generate a unique ID for the new sandbox
		const id = newId();
		// Create a new sheet for the sandbox
		dispatchAddNewSheetEvent({
			id,
			sheetName: args.sandbox_name,
			sheetType: "sandbox", // Explicitly set the sheet type to sandbox
		});

		// A small delay to ensure the sheet is created before updating content
		setTimeout(() => {
			// Update the sandbox content with the provided HTML
			dispatchUpdateSandboxContentEvent({
				id,
				htmlContent: args.html_content,
			});
		}, 1000);
		// Return information about the created sandbox
		return {
			id,
			sandbox_name: args.sandbox_name,
			status: "Sandbox created successfully",
		};
	}

	// Return an error if required arguments are missing
	return {
		error:
			"Missing required arguments: sandbox_name and html_content are required",
	};
};

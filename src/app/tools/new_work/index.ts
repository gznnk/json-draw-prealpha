import { definition } from "./definition";
import { createHandler } from "./handler";
import { useTool } from "./hooks";

/**
 * Aggregated object for the new_work tool utilities
 * - definition: tool definition
 * - createHandler: function to create a handler with an EventBus
 * - useTool: hook to listen for tool events
 */
export const newWork = {
	definition,
	createHandler,
	useTool,
};

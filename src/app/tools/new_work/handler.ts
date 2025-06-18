/**
 * Handles the creation of a new work.
 * Creates a work with the specified name and dispatches the corresponding event.
 *
 * @param eventBus - EventBus instance for dispatching work creation events
 * @returns A function handler that processes function calls and dispatches events
 */
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../shared/llm-client/types";
import type { EventBus } from "../../../shared/event-bus/EventBus";
import { NEW_WORK_EVENT } from "./constants";

/**
 * Factory to create a handler
 * Accepts an EventBus and returns a FunctionCallHandler
 *
 * @param eventBus - EventBus instance used to dispatch events
 * @returns Handler that processes function calls
 */
export const createHandler = (eventBus: EventBus): FunctionCallHandler => {
	// Return the actual handler function
	return (functionCall: FunctionCallInfo) => {
		const args = functionCall.arguments as { work_name: string };

		if (typeof args.work_name === "string") {
			const id = crypto.randomUUID();

			// Create work data
			const workData = {
				id,
				name: args.work_name,
				// Default type and path
				type: "markdown",
				path: args.work_name,
			};

			// Dispatch event via provided EventBus
			eventBus.dispatchEvent(
				new CustomEvent(NEW_WORK_EVENT, {
					detail: workData,
				}),
			);

			return {
				id,
				work_name: args.work_name,
			};
		}

		return null;
	};
};

// Dummy implementation to avoid errors before runtime initialization
// Overwritten in index.ts with the real EventBus
export const handler: FunctionCallHandler = () => null;

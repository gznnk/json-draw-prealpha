/**
 * Handles the creation of a new work.
 * Creates a work with the specified name and dispatches the corresponding event.
 *
 * @param functionCall - The function call information containing work_name
 * @returns Object containing the ID and work name or null if required arguments are missing
 */
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../shared/llm-client/types";
import { EventBus } from "../../../shared/event-bus/EventBus";
import { NEW_WORK_EVENT } from "./constants";

// Create an event bus instance for new_work events
export const newWorkEventBus = new EventBus();

export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { work_name: string };

	if (typeof args.work_name === "string") {
		const id = crypto.randomUUID();

		// Create work data
		const workData = {
			id,
			name: args.work_name,
			// デフォルトのタイプとパス
			type: "markdown",
			path: args.work_name,
		};

		// Dispatch event via EventBus
		newWorkEventBus.dispatchEvent(
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

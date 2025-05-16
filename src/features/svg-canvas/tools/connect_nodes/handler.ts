// Import functions related to SvgCanvas.
import { newEventId } from "../../utils";
import { dispatchConnectNodesEvent } from "../../canvas/observers/connectNodes";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../llm-client/types";

/**
 * Handles the connection between two nodes.
 * Creates a connection and dispatches the connect nodes event.
 *
 * @param functionCall - The function call information containing sourceNodeId and targetNodeId.
 * @returns Object containing the sourceNodeId and targetNodeId or null if required arguments are missing.
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as {
		sourceNodeId: string;
		targetNodeId: string;
	};

	if (
		typeof args.sourceNodeId === "string" &&
		typeof args.targetNodeId === "string"
	) {
		// Trigger connect nodes event using the global trigger function
		dispatchConnectNodesEvent({
			eventId: newEventId(),
			sourceNodeId: args.sourceNodeId,
			targetNodeId: args.targetNodeId,
		});

		// Return the connection data
		return {
			sourceNodeId: args.sourceNodeId,
			targetNodeId: args.targetNodeId,
		};
	}

	return null;
};

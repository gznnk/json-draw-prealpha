// Import React.
import { useCallback } from "react";

// Import types.
import type { ConnectNodesEvent } from "../../types/events/ConnectNodesEvent";

// Import constants.
import { EVENT_NAME_CONNECT_NODES } from "../../constants/core/EventNames";

// Import utils.
import { newEventId } from "../../utils/core/newEventId";

// Import context.
import type { EventBus } from "../../../../shared/event-bus/EventBus";

// Import shared.
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client";

/**
 * React hook to dispatch ConnectNodesEvent using the shared event bus.
 * Returns a memoized function.
 */
export const useConnectNodesTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				sourceNodeId: string;
				targetNodeId: string;
			};

			if (
				typeof args.sourceNodeId === "string" &&
				typeof args.targetNodeId === "string"
			) {
				const event = {
					eventId: newEventId(),
					sourceNodeId: args.sourceNodeId,
					targetNodeId: args.targetNodeId,
				} as ConnectNodesEvent;

				const customEvent = new CustomEvent(EVENT_NAME_CONNECT_NODES, {
					detail: event,
				});
				eventBus.dispatchEvent(customEvent);

				// Return the connection data
				return {
					sourceNodeId: args.sourceNodeId,
					targetNodeId: args.targetNodeId,
				};
			}

			return null;
		},
		[eventBus],
	);
};

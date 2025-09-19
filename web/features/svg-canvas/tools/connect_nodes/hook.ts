import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client";
import { EVENT_NAME_CONNECT_NODES } from "../../constants/core/EventNames";
import type { ConnectNodesEvent } from "../../types/events/ConnectNodesEvent";
import { newEventId } from "../../utils/core/newEventId";

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

// Import React.
import { useCallback } from "react";

// Import types.
import type { ConnectNodesEvent } from "../../types/events/ConnectNodesEvent";

// Import constants.
import { EVENT_NAME_CONNECT_NODE } from "../../constants/EventNames";

// Import context.
import { useEventBus } from "../../context/EventBusContext";

/**
 * React hook to dispatch ConnectNodesEvent using the shared event bus.
 * Returns a memoized function.
 */
export const useConnectNode = () => {
	const eventBus = useEventBus();
	return useCallback(
		(event: ConnectNodesEvent) => {
			const customEvent = new CustomEvent(EVENT_NAME_CONNECT_NODE, {
				detail: event,
			});
			eventBus.dispatchEvent(customEvent);
		},
		[eventBus],
	);
};

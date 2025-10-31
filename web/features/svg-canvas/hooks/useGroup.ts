import { useCallback } from "react";

import { GROUP_EVENT_NAME } from "../constants/core/EventNames";
import { useEventBus } from "../context/EventBusContext";
import type { GroupEvent } from "../types/events/GroupEvent";

/**
 * Hook for grouping diagrams via the event bus.
 * Dispatches GroupEvent to the event bus.
 */
export const useGroup = () => {
	// Get EventBus instance from context
	const eventBus = useEventBus();

	// Function to dispatch group events
	return useCallback(
		(event: GroupEvent) => {
			// Dispatch the GroupEvent to the EventBus
			eventBus.dispatchEvent(
				new CustomEvent(GROUP_EVENT_NAME, { detail: event }),
			);
		},
		[eventBus],
	);
};

import { useCallback } from "react";

import { UNGROUP_EVENT_NAME } from "../constants/core/EventNames";
import { useEventBus } from "../context/EventBusContext";
import type { UngroupEvent } from "../types/events/UngroupEvent";

/**
 * Hook for ungrouping diagrams via the event bus.
 * Dispatches UngroupEvent to the event bus.
 */
export const useUngroup = () => {
	// Get EventBus instance from context
	const eventBus = useEventBus();

	// Function to dispatch ungroup events
	return useCallback(
		(event?: UngroupEvent) => {
			// Dispatch the UngroupEvent to the EventBus
			eventBus.dispatchEvent(
				new CustomEvent(UNGROUP_EVENT_NAME, { detail: event ?? {} }),
			);
		},
		[eventBus],
	);
};

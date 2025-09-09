// Import React.
import { useCallback } from "react";

// Import constants.
import { ADD_NEW_DIAGRAM_EVENT_NAME } from "../constants/core/EventNames";

// Import types.
import type { Diagram } from "../types/state/core/Diagram";
import type { AddDiagramEvent } from "../types/events/AddDiagramEvent";

// Import utils.
import { newEventId } from "../utils/core/newEventId";

// Import context.
import { useEventBus } from "../context/EventBusContext";

export const useAddDiagram = () => {
	// Get EventBus instance from context
	const eventBus = useEventBus();

	// Function to dispatch a new AddDiagramEvent
	return useCallback(
		(diagram: Diagram) => {
			const event: AddDiagramEvent = {
				eventId: newEventId(),
				item: diagram,
			};

			// Dispatch the AddDiagramEvent to the EventBus.
			eventBus.dispatchEvent(
				new CustomEvent(ADD_NEW_DIAGRAM_EVENT_NAME, { detail: event }),
			);
		},
		[eventBus],
	);
};

// Import React.
import { useCallback } from "react";

// Import constants.
import { ADD_NEW_DIAGRAM_EVENT_NAME } from "../constants/core/EventNames";
import type { Diagram } from "../types/state/catalog/Diagram";

// Import types.
import type { AddDiagramEvent } from "../types/events/AddDiagramEvent";
import { newEventId } from "../utils/core/newEventId";

// Import shared module files.
import type { EventBus } from "../../../shared/event-bus/EventBus";

/**
 * Returns a callback for tool modules to dispatch an AddDiagramEvent using the provided eventBus.
 * @param eventBus - The EventBus instance to dispatch the event through
 */
export const useAddDiagramWithBus = (eventBus: EventBus) => {
	return useCallback(
		(diagram: Diagram) => {
			const event: AddDiagramEvent = {
				eventId: newEventId(),
				item: diagram,
			};
			eventBus.dispatchEvent(
				new CustomEvent(ADD_NEW_DIAGRAM_EVENT_NAME, { detail: event }),
			);
		},
		[eventBus],
	);
};

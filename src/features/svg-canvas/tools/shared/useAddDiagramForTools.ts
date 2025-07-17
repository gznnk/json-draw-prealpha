import { useCallback } from "react";
import { ADD_NEW_DIAGRAM_EVENT_NAME } from "../../constants/EventNames";
import type { Diagram } from "../../types/data/catalog/Diagram";
import type { AddDiagramEvent } from "../../types/events/AddDiagramEvent";
import { newEventId } from "../../utils/common/newEventId";

/**
 * Returns a callback for tool modules to dispatch an AddDiagramEvent using the provided eventBus.
 * @param eventBus - The EventBus instance to dispatch the event through
 */
export const useAddDiagramForTools = (eventBus: EventTarget | undefined) => {
	return useCallback(
		(diagram: Diagram) => {
			if (!eventBus) return;
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

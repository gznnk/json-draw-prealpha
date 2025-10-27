import { useCallback } from "react";

import { STYLE_CHANGE_EVENT_NAME } from "../constants/core/EventNames";
import { useEventBus } from "../context/EventBusContext";
import type {
	DiagramStyleChangeEvent,
	DiagramStyle,
} from "../types/events/DiagramStyleChangeEvent";
import type { Diagram } from "../types/state/core/Diagram";
import { newEventId } from "../utils/core/newEventId";
import { isItemableState } from "../utils/validation/isItemableState";

export type ApplyStyleChangeParams = {
	items: Diagram[];
	styleData: Partial<DiagramStyle>;
	recursively?: boolean;
	eventId?: string;
};

/**
 * Hook for applying style changes to diagrams via the event bus.
 * Dispatches DiagramStyleChangeEvent to the event bus.
 * Can apply changes recursively to nested items.
 */
export const useStyleChange = () => {
	// Get EventBus instance from context
	const eventBus = useEventBus();

	// Function to dispatch style change events
	const applyStyleChange = useCallback(
		(params: ApplyStyleChangeParams) => {
			const {
				items,
				styleData,
				recursively = true,
				eventId = newEventId(),
			} = params;

			for (const item of items) {
				const event: DiagramStyleChangeEvent = {
					eventId,
					id: item.id,
					data: styleData,
				};

				// Dispatch the StyleChangeEvent to the EventBus
				eventBus.dispatchEvent(
					new CustomEvent(STYLE_CHANGE_EVENT_NAME, { detail: event }),
				);

				if (recursively && isItemableState(item)) {
					applyStyleChange({
						items: item.items,
						styleData,
						recursively,
						eventId,
					});
				}
			}
		},
		[eventBus],
	);

	return applyStyleChange;
};

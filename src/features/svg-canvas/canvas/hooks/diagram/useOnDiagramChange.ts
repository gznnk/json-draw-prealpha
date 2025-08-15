// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { EventPhase } from "../../../types/events/EventPhase";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { InteractionState } from "../../types/InteractionState";

// Import utils.
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";

// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Determines if an item should be in changing state based on event phase.
 * Pure function for consistent state management.
 */
const getIsChangingState = (eventPhase: EventPhase): boolean => {
	return eventPhase === "Started" || eventPhase === "InProgress";
};

/**
 * Custom hook to handle diagram change events on the canvas.
 */
export const useOnDiagramChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;
		const { addHistory } = refBus.current;

		setCanvasState((prevState) => {
			// Create a new state with the updated items and multi-select group.
			let newState = {
				...prevState,
				items: applyFunctionRecursively(prevState.items, (item) => {
					// If the id does not match, return the original item.
					if (item.id !== e.id) return item;

					// If the id matches, update the item with the new properties.
					const newItem = { ...item, ...e.endDiagram };

					// Return the updated item.
					return newItem;
				}),
				interactionState: getIsChangingState(e.eventPhase)
					? InteractionState.Changing
					: InteractionState.Idle,
			};

			newState.items = updateOutlineOfAllItemables(newState.items);

			// If the event has minX and minY, update the canvas state
			if (e.minX !== undefined && e.minY !== undefined) {
				newState.minX = e.minX;
				newState.minY = e.minY;
			}

			if (isHistoryEvent(e.eventPhase)) {
				// Add history
				newState = addHistory(e.eventId, newState);
			}

			return newState;
		});
	}, []);
};

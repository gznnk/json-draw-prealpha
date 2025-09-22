import { useCallback, useRef } from "react";

import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { EventPhase } from "../../../types/events/EventPhase";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
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
			addHistory,
		} = refBus.current;

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

			if (e.eventPhase === "Ended") {
				// Add history
				newState = addHistory(e.eventId, newState);
			}

			return newState;
		});
	}, []);
};

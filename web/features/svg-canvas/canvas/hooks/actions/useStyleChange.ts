import { useCallback, useRef } from "react";

import type { DiagramStyleChangeEvent } from "../../../types/events/DiagramStyleChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle diagram style change events on the canvas.
 */
export const useStyleChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramStyleChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;
		const { addHistory } = refBus.current;

		setCanvasState((prevState) => {
			// Update items with style changes.
			const items = applyFunctionRecursively(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// Extract style properties from the event.
				const { eventId: _eventId, id: _id, ...styleChanges } = e;

				// If the id matches, update the item with the new style properties.
				return { ...item, ...styleChanges };
			});

			// Create new state with updated items.
			let newState = {
				...prevState,
				items,
			};

			// Add history
			newState = addHistory(e.eventId, newState);

			return newState;
		});
	}, []);
};

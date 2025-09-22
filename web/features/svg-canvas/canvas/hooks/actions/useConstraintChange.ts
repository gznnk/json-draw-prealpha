import { useCallback, useRef } from "react";

import type { DiagramConstraintChangeEvent } from "../../../types/events/DiagramConstraintChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle diagram constraint change events on the canvas.
 */
export const useConstraintChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramConstraintChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;
		const { addHistory } = refBus.current;

		setCanvasState((prevState) => {
			// Update items with constraint changes.
			const items = applyFunctionRecursively(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// Extract constraint properties from the event.
				const { eventId: _eventId, id: _id, ...constraintChanges } = e;

				// If the id matches, update the item with the new constraint properties.
				return { ...item, ...constraintChanges };
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

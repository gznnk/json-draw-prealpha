// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramConstraintChangeEvent } from "../../../types/events/DiagramConstraintChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

/**
 * Custom hook to handle diagram constraint change events on the canvas.
 */
export const useDiagramConstraintChange = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramConstraintChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
		} = refBus.current;

		setCanvasState((prevState) => {
			// Update items with constraint changes.
			const items = applyFunctionRecursively(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// Extract constraint properties from the event.
				const { eventId, id, ...constraintChanges } = e;

				// If the id matches, update the item with the new constraint properties.
				return { ...item, ...constraintChanges };
			});

			// Create new state with updated items.
			let newState = {
				...prevState,
				items,
			};

			// Add a new history entry.
			newState.lastHistoryEventId = e.eventId;
			newState = addHistory(prevState, newState);

			// Notify the data change.
			onDataChange?.(svgCanvasStateToData(newState));

			// Return new state with updated items.
			return newState;
		});
	}, []);
};

// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramStyleChangeEvent } from "../../../types/events/DiagramStyleChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

/**
 * Custom hook to handle diagram style change events on the canvas.
 */
export const useDiagramStyleChange = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramStyleChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
		} = refBus.current;

		setCanvasState((prevState) => {
			// Update items with style changes.
			const items = applyFunctionRecursively(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// Extract style properties from the event.
				const { eventId, id, ...styleChanges } = e;

				// If the id matches, update the item with the new style properties.
				return { ...item, ...styleChanges };
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

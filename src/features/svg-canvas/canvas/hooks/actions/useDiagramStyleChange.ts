// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramStyleChangeEvent } from "../../../types/events/DiagramStyleChangeEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { applyRecursive } from "../../utils/applyRecursive";

/**
 * Custom hook to handle diagram style change events on the canvas.
 */
export const useDiagramStyleChange = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramStyleChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;

		setCanvasState((prevState) => {
			// Update items with style changes.
			const items = applyRecursive(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// Extract style properties from the event.
				const { eventId, id, ...styleChanges } = e;

				// If the id matches, update the item with the new style properties.
				const newItem = { ...item, ...styleChanges };

				return newItem;
			});

			// Return new state with updated items.
			return {
				...prevState,
				items,
			};
		});
	}, []);
};

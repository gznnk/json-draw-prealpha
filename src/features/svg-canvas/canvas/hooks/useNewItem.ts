// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { NewItemEvent } from "../../types/EventTypes";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../utils/TypeUtils";
import { addHistory } from "../SvgCanvasFunctions";

/**
 * Custom hook to handle new item events on the canvas.
 */
export const useNewItem = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: NewItemEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				items: [
					...prevState.items.map((i) => {
						if (isSelectableData(i) && isSelectableData(e.item)) {
							return {
								...i,
								// If the new item is selected, unselect other items.
								isSelected: e.item.isSelected ? false : i.isSelected,
							};
						}
						return i;
					}),
					{
						...e.item,
					},
				],
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = e.eventId;
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};

// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { AddDiagramEvent } from "../../../types/events/AddDiagramEvent";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useAddDiagram = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: AddDiagramEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState, onDataChange } = refBus.current.props;

		// Call the function to add a new item to the canvas.
		setCanvasState((prevState) => {
			let newItems = prevState.items;
			if (isSelectableData(e.item) && e.item.isSelected) {
				newItems = clearSelectionRecursively(prevState.items);
			}
			let newState = {
				...prevState,
				items: [...newItems, e.item],
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = e.eventId;
			newState = addHistory(prevState, newState);

			// Notify the data change.
			onDataChange?.(svgCanvasStateToData(newState));

			return newState;
		});
	}, []);
};

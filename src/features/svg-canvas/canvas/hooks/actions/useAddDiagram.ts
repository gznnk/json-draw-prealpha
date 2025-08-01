// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { AddDiagramEvent } from "../../../types/events/AddDiagramEvent";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { isSelectableData } from "../../../utils/validation/isSelectableData";

import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";

// Import hooks.
import { useDataChange } from "../history/useDataChange";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useAddDiagram = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: AddDiagramEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

		// Call the function to add a new item to the canvas.
		setCanvasState((prevState) => {
			let newItems = prevState.items;
			if (isSelectableData(e.item) && e.item.isSelected) {
				newItems = clearSelectionRecursively(prevState.items);
			}
			const newState = {
				...prevState,
				items: [...newItems, e.item],
			} as SvgCanvasState;

			// Notify the data change.
			onDataChange(e.eventId, newState);

			return newState;
		});
	}, []);
};

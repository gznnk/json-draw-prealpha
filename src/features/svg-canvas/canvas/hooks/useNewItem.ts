// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { NewItemEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Imports related to this component.
import { useAddItem } from "./useAddItem";

/**
 * Custom hook to handle new item events on the canvas.
 */
export const useNewItem = (props: CanvasHooksProps) => {
	// Get the function to add items to the canvas.
	const addItem = useAddItem(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		addItem,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: NewItemEvent) => {
		// Bypass references to avoid function creation in every render.
		const { addItem } = refBus.current;

		addItem(e.item);
	}, []);
};

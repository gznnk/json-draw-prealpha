// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../types/DiagramCatalog";
import type { CanvasHooksProps, SvgCanvasState } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newEventId } from "../../utils/Util";
import { addHistory } from "../SvgCanvasFunctions";

/**
 * Custom hook to add a item to the canvas.
 */
export const useAddItem = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((item: Diagram) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				items: [
					...prevState.items.map((item) => ({ ...item, isSelected: false })),
					{
						...item,
						isSelected: true,
					},
				],
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};

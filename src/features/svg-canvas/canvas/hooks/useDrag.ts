// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramDragEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import hooks related to SvgCanvas.
import { useCanvasResize } from "./useCanvasResize";

// Import functions related to SvgCanvas.
import {
	addHistory,
	applyRecursive,
	isDiagramChangingEvent,
	isHistoryEvent,
	updateConnectPointsAndNotifyMove,
	updateOutlineOfAllGroups,
} from "../SvgCanvasFunctions";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useDrag = (props: CanvasHooksProps) => {
	// Get the canvas resize function to handle canvas resizing.
	const canvasResize = useCanvasResize(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		canvasResize,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			canvasResize,
		} = refBus.current;

		setCanvasState((prevState) => {
			let newState = {
				...prevState,
				items: applyRecursive(prevState.items, (item) => {
					if (item.id === e.id) {
						// Apply the new position to the item.
						const newItem = {
							...item,
							x: e.endX,
							y: e.endY,
						};

						// Update the connect points of the diagram.
						// And notify the connect points move event to ConnectLine.
						return updateConnectPointsAndNotifyMove(
							e.eventId,
							e.eventType,
							newItem,
						);
					}
					return item;
				}),
				isDiagramChanging: isDiagramChangingEvent(e.eventType),
			};

			// Update outline of all groups.
			newState.items = updateOutlineOfAllGroups(newState.items);

			// Add a new history entry.
			if (isHistoryEvent(e.eventType)) {
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
			}

			return newState;
		});

		// Resize the canvas if the cursor is near the edges.
		canvasResize({
			cursorX: e.cursorX ?? e.endX,
			cursorY: e.cursorY ?? e.endY,
		});
	}, []);
};

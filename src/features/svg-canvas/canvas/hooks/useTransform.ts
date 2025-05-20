// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTransformEvent } from "../../types/events/DiagramTransformEvent";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import hooks related to SvgCanvas.
import { useCanvasResize } from "./useCanvasResize";

// Import functions related to SvgCanvas.
import { addHistory } from "../utils/addHistory";
import { applyRecursive } from "../utils/applyRecursive";
import { isDiagramChangingEvent } from "../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../utils/isHistoryEvent";
import { updateConnectPointsAndNotifyMove } from "../utils/updateConnectPointsAndNotifyMove";
import { updateOutlineOfAllGroups } from "../utils/updateOutlineOfAllGroups";

/**
 * Custom hook to handle transform events on the canvas.
 */
export const useTransform = (props: CanvasHooksProps) => {
	// Get the canvas resize function to handle canvas resizing.
	const canvasResize = useCanvasResize(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		canvasResize,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTransformEvent) => {
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
						// Apply the new shape to the item.
						const newItem = {
							...item,
							...e.endShape,
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
			cursorX: e.cursorX ?? e.endShape.x,
			cursorY: e.cursorY ?? e.endShape.y,
		});
	}, []);
};

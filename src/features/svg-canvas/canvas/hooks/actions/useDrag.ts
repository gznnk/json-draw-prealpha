// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import hooks related to SvgCanvas.
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";

// Import functions related to SvgCanvas.
import { addHistory } from "../../utils/addHistory";
import { applyRecursive } from "../../utils/applyRecursive";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateConnectPointsAndNotifyMove } from "../../utils/updateConnectPointsAndNotifyMove";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useDrag = (props: CanvasHooksProps) => {
	// Get the auto edge scroll function to handle canvas auto scrolling.
	const autoEdgeScroll = useAutoEdgeScroll(props);
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		autoEdgeScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
			autoEdgeScroll,
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

			if (isHistoryEvent(e.eventType)) {
				// Add a new history entry.
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);

				// Notify the data change.
				onDataChange?.(svgCanvasStateToData(newState));
			}

			return newState;
		});

		// Auto scroll if the cursor is near the edges.
		autoEdgeScroll({
			cursorX: e.cursorX,
			cursorY: e.cursorY,
		});
	}, []);
};

// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramDragEvent } from "../../types/EventTypes";

// Import functions related to SvgCanvas.
import {
	addHistory,
	applyRecursive,
	isHistoryEvent,
	updateConnectPointsAndNotifyMove,
	updateOutlineOfAllGroups,
} from "../SvgCanvasFunctions";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useDrag = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

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
				isDiagramChanging: e.eventType !== "End" && e.eventType !== "Instant",
			};

			// Update outline of all groups.
			newState.items = updateOutlineOfAllGroups(newState.items);

			if (isHistoryEvent(e.eventType)) {
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);
			}

			return newState;
		});
	}, []);
};

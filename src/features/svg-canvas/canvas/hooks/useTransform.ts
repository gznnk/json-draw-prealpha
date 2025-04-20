// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramTransformEvent } from "../../types/EventTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

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
 * Custom hook to handle transform events on the canvas.
 */
export const useTransform = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramTransformEvent) => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

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
	}, []);
};

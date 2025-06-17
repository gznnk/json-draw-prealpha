import type { Diagram } from "../../types/data/catalog/Diagram";
import { notifyConnectPointsMove } from "../../components/shapes/ConnectLine";
import type { ConnectableData } from "../../types/data/shapes/ConnectableData";
import type { EventType } from "../../types/events/EventType";
import { applyConnectPointMoveData } from "./applyConnectPointMoveData";
import { createConnectPointMoveData } from "./createConnectPointMoveData";

/**
 * Update the connect points and notify the move event.
 *
 * Note: This is an **impure** function — it mutates the `newItem` argument directly.
 *
 * @param eventId - The ID of the event.
 * @param eventType - The type of the event.
 * @param newItem - The new item to be updated.
 * @returns {Diagram} - The updated item.
 */
export const updateConnectPointsAndNotifyMove = (
	eventId: string,
	eventType: EventType,
	newItem: Diagram,
): Diagram => {
	const connectPoints = createConnectPointMoveData(newItem);
	if (connectPoints.length > 0) {
		applyConnectPointMoveData(
			newItem as ConnectableData, // newItem can be safely cast to ConnectableData when a connect point is created.
			connectPoints,
		);

		// Notify the connection point move event to ConnectLine components.
		notifyConnectPointsMove({
			eventId,
			eventType,
			points: connectPoints,
		});
	}
	return newItem;
};
